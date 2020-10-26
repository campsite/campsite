package db

import (
	"context"
	"errors"
	"time"

	"campsite.social/campsite/apiserver/pubsub"
	"campsite.social/campsite/apiserver/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
)

type Post struct {
	ID           uuid.UUID
	CreatedAt    time.Time
	EditedAt     *time.Time
	DeletedAt    *time.Time
	LastActiveAt time.Time
	Content      *string
	Warning      *string

	Author *User

	ParentPostID *uuid.UUID
	ParentPost   *Post

	ParentNextPageToken PostChildrenNextPageToken
	NumChildren         int
}

type deferredLoadsForPost struct {
	usersToFetch map[uuid.UUID][]*User
}

// basePostsByID only fetches records from the posts table. This is to allow for recursive lookup of parent posts in one go without running N+1 queries.
func basePostsByID(ctx context.Context, tx *Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*Post, *deferredLoadsForPost, error) {
	posts := map[uuid.UUID]*Post{}

	deferred := &deferredLoadsForPost{
		usersToFetch: map[uuid.UUID][]*User{},
	}

	// Fetch the posts.
	if err := tx.Query(ctx, `
		select
			id,
			created_at,
			edited_at,
			deleted_at,
			last_active_at,
			content,
			warning,
			author_user_id,
			(select p.ancestor_post_id from post_ancestors p where p.descendant_post_id = posts.id and distance = 1),
			(select count(1) from post_ancestors p where p.ancestor_post_id = posts.id and distance = 1)
		from
			posts
		where
			id = any($1)
	`, ids).Rows(func(rows pgx.Rows) error {
		p := &Post{}

		var authorUserID *uuid.UUID
		if err := rows.Scan(&p.ID, &p.CreatedAt, &p.EditedAt, &p.DeletedAt, &p.LastActiveAt, &p.Content, &p.Warning, &authorUserID, &p.ParentPostID, &p.NumChildren); err != nil {
			return err
		}

		p.ParentNextPageToken = PostChildrenNextPageToken{
			LastActiveAt: p.LastActiveAt,
			CreatedAt:    p.CreatedAt,
			ID:           p.ID,
		}

		if authorUserID != nil {
			p.Author = &User{
				ID: *authorUserID,
			}
			deferred.usersToFetch[*authorUserID] = append(deferred.usersToFetch[*authorUserID], p.Author)
		}

		posts[p.ID] = p
		return nil
	}); err != nil {
		return nil, nil, err
	}

	// Fetch the parents, if we have any.
	if parentDepth > 0 {
		paths := make(map[uuid.UUID][]uuid.UUID, len(ids))
		var postsToFetch []uuid.UUID

		if err := tx.Query(ctx, `
			select
				descendant_post_id,
				array_agg(ancestor_post_id order by distance)
			from post_ancestors
			where
				descendant_post_id = any($1) and
				distance > 0 and
				distance <= $2
			group by descendant_post_id
		`, ids, parentDepth).Rows(func(rows pgx.Rows) error {
			var postID uuid.UUID
			var path []uuid.UUID
			if err := rows.Scan(&postID, &path); err != nil {
				return err
			}

			paths[postID] = path
			postsToFetch = append(postsToFetch, path...)
			return nil
		}); err != nil {
			return nil, nil, err
		}

		parents, parentsDeferred, err := basePostsByID(ctx, tx, postsToFetch, 0)
		if err != nil {
			return nil, nil, err
		}

		// Merge deferred.
		for userID, users := range parentsDeferred.usersToFetch {
			deferred.usersToFetch[userID] = append(deferred.usersToFetch[userID], users...)
		}

		// Fill in the posts along the path.
		for postID, path := range paths {
			current := posts[postID]
			for _, nextPostID := range path {
				current.ParentPost = parents[nextPostID]
				current = current.ParentPost
			}
		}
	}

	return posts, deferred, nil
}

func PostsByID(ctx context.Context, tx *Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*Post, error) {
	posts, deferred, err := basePostsByID(ctx, tx, ids, parentDepth)
	if err != nil {
		return nil, err
	}

	userIDs := make([]uuid.UUID, 0, len(deferred.usersToFetch))

	for userID := range deferred.usersToFetch {
		userIDs = append(userIDs, userID)
	}

	users, err := UsersByID(ctx, tx, userIDs)
	if err != nil {
		return nil, err
	}

	for userID, us := range deferred.usersToFetch {
		for _, u := range us {
			*u = *users[userID]
		}
	}

	return posts, nil
}

type PostChildrenNextPageToken struct {
	LastActiveAt time.Time
	CreatedAt    time.Time
	ID           uuid.UUID
}

type DescendantsPageToken struct {
	CreatedAt time.Time
	ID        uuid.UUID
	Direction PageDirection
}

type DescendantsPageTokenPair struct {
	Next *DescendantsPageToken
	Prev *DescendantsPageToken
}

func PostChildrenByID(ctx context.Context, tx *Tx, postID uuid.UUID, childDepth int, pageToken PostChildrenNextPageToken, limit int) ([]*Post, DescendantsPageToken, error) {
	var childPosts []*Post
	var childPostIDs []uuid.UUID

	if err := tx.Query(ctx, `
		with recursive children (post_id, last_active_at, created_at, depth) as
		(
			(
				select
					id,
					last_active_at,
					created_at,
					1
				from
					posts
				inner join
					post_ancestors on post_ancestors.descendant_post_id = posts.id
				where
					post_ancestors.ancestor_post_id = $1 and
					post_ancestors.distance = 1 and
					(
						(last_active_at < $2) or
						(last_active_at = $2 and created_at < $3) or
						(last_active_at = $2 and created_at = $3 and id > $4)
					)
				order by
					last_active_at desc, created_at desc, id asc
				limit $6
			)
			union all
			(
				select
					posts.id,
					posts.last_active_at,
					posts.created_at,
					children.depth + 1
				from
					children
				inner join lateral (
					select posts.*
					from post_ancestors
					inner join
						posts on posts.id = post_ancestors.descendant_post_id
					where
						post_ancestors.ancestor_post_id = children.post_id and
						post_ancestors.distance = 1 and
						children.depth + 1 <= $5
					order by
						posts.last_active_at desc, posts.created_at desc, posts.id asc
					limit $6
				) posts on true
			)
		)
		select
			post_id
		from
			children
		order by
			depth,
			last_active_at desc,
			created_at desc,
			post_id
	`, postID, pageToken.LastActiveAt, pageToken.CreatedAt, pageToken.ID, childDepth, limit).Rows(func(rows pgx.Rows) error {
		child := &Post{}
		if err := rows.Scan(&child.ID); err != nil {
			return err
		}
		childPostIDs = append(childPostIDs, child.ID)
		return nil
	}); err != nil {
		return nil, DescendantsPageToken{}, err
	}

	posts, err := PostsByID(ctx, tx, childPostIDs, 0)
	if err != nil {
		return nil, DescendantsPageToken{}, err
	}

	// Fill in the posts, in the order they were retrieved (level order).
	for _, childPostID := range childPostIDs {
		childPosts = append(childPosts, posts[childPostID])
	}

	// Find the absolute last descendant so we can start paginating from there.
	descendantsPageToken := DescendantsPageToken{
		Direction: PageDirectionNewer,
	}
	if err := tx.Query(ctx, `
		select
			posts.id,
			posts.created_at
		from
			post_ancestors
		inner join
			posts on posts.id = post_ancestors.descendant_post_id
		where
			post_ancestors.ancestor_post_id = $1 and
			post_ancestors.distance > 0 and
			post_ancestors.distance <= $2
		order by
			posts.created_at desc, posts.id asc
		limit 1
	`, postID, childDepth).Row(&descendantsPageToken.ID, &descendantsPageToken.CreatedAt); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			descendantsPageToken.ID = pageToken.ID
			descendantsPageToken.CreatedAt = pageToken.CreatedAt
		} else {
			return nil, DescendantsPageToken{}, err
		}
	}

	return childPosts, descendantsPageToken, nil
}

func notifyPostDescendants(ctx context.Context, pbsb *pubsub.PubSub, ancestorPostID uuid.UUID) error {
	if err := pbsb.Publish(ctx, "descendants:"+types.EncodeID(ancestorPostID), []byte{}); err != nil {
		return err
	}
	return nil
}

func WaitForPostDescendants(ctx context.Context, db *DB, pbsb *pubsub.PubSub, postID uuid.UUID, childDepth int, pageToken DescendantsPageToken) error {
	if pageToken.Direction != PageDirectionNewer {
		return nil
	}

	// We must subscribe before we check hasNewer, otherwise we have a race condition.
	sub, err := pbsb.Subscribe(ctx, "descendants:"+types.EncodeID(postID))
	if err != nil {
		return err
	}
	defer sub.Unsubscribe(ctx)

	for {
		var hasNewer bool
		if err := db.Query(ctx, `
			select exists(
				select 1
				from post_ancestors
				inner join posts on posts.id = post_ancestors.descendant_post_id
				where
					ancestor_post_id = $1 and (
						case
							when $4 = -1 then (
								(posts.created_at < $2) or
								(posts.created_at = $2 and posts.id > $3)
							)
							when $4 = 1 then (
								(posts.created_at > $2) or
								(posts.created_at = $2 and posts.id < $3)
							)
							else false
						end
					) and
					distance <= $5
			)
		`, postID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction, childDepth).Row(&hasNewer); err != nil {
			return err
		}

		if hasNewer {
			break
		}

		if err := func() error {
			// Wake up every 10 seconds to check for new posts, in case we missed them.
			ctx, cancel := context.WithTimeout(ctx, waitTimeout)
			defer cancel()

			msg, err := sub.Receive(ctx)
			if err != nil {
				if errors.Is(err, context.DeadlineExceeded) {
					return nil
				}
				return err
			}

			_ = msg
			return nil
		}(); err != nil {
			return err
		}
	}

	return nil
}

func PostDescendantsByID(ctx context.Context, tx *Tx, postID uuid.UUID, childDepth int, pageToken DescendantsPageToken, limit int) ([]*Post, DescendantsPageTokenPair, error) {
	var postIDs []uuid.UUID
	var postIDsToFetch []uuid.UUID

	if err := tx.Query(ctx, `
		select
			(
				select
					array_agg(ancestor_post_id order by distance)
				from post_ancestors
				where
					descendant_post_id = posts.id and
					distance <= (
						select
							distance
						from post_ancestors
						where
							ancestor_post_id = $1 and
							descendant_post_id = posts.id))
		from post_ancestors
		inner join
			posts on posts.id = post_ancestors.descendant_post_id
		where
			ancestor_post_id = $1 and (
				case
					when $4 = -1 then (
						(posts.created_at < $2) or
						(posts.created_at = $2 and posts.id > $3)
					)
					when $4 = 1 then (
						(posts.created_at > $2) or
						(posts.created_at = $2 and posts.id < $3)
					)
					else false
				end
			) and
			distance > 0 and
			distance <= $5
		order by
			posts.created_at desc, posts.id asc
		limit $6
	`, postID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction, childDepth, limit).Rows(func(rows pgx.Rows) error {
		var path []uuid.UUID
		if err := rows.Scan(&path); err != nil {
			return err
		}

		// 0th item on the path is the current post, last item is the root post.
		postIDs = append(postIDs, path[0])
		postIDsToFetch = append(postIDsToFetch, path[:len(path)-1]...)
		return nil
	}); err != nil {
		return nil, DescendantsPageTokenPair{}, err
	}

	postsMap, err := PostsByID(ctx, tx, postIDsToFetch, 0)
	if err != nil {
		return nil, DescendantsPageTokenPair{}, err
	}

	posts := make([]*Post, 0, len(postIDs))
	for _, descendantPostID := range postIDs {
		post := postsMap[descendantPostID]
		posts = append(posts, post)

		// Fill in the parents.
		for post.ParentPostID != nil && *post.ParentPostID != postID {
			post.ParentPost = postsMap[*post.ParentPostID]
			post = post.ParentPost
		}
	}

	var ptp DescendantsPageTokenPair
	if len(posts) > 0 {
		if len(posts) >= limit || pageToken.Direction == PageDirectionNewer {
			ptp.Next = &DescendantsPageToken{
				CreatedAt: posts[len(posts)-1].CreatedAt,
				ID:        posts[len(posts)-1].ID,
				Direction: PageDirectionOlder,
			}
		}

		ptp.Prev = &DescendantsPageToken{
			CreatedAt: posts[0].CreatedAt,
			ID:        posts[0].ID,
			Direction: PageDirectionNewer,
		}
	} else {
		ptp.Prev = &DescendantsPageToken{
			CreatedAt: pageToken.CreatedAt,
			ID:        pageToken.ID,
			Direction: PageDirectionNewer,
		}
	}

	return posts, ptp, nil
}

type PostSkeleton struct {
	AuthorUserID uuid.UUID
	Content      string
	Warning      *string
	ParentPostID *uuid.UUID
}

func CreatePost(ctx context.Context, tx *Tx, pbsb *pubsub.PubSub, postSkeleton *PostSkeleton) (*Post, error) {
	var postID uuid.UUID
	var createdAt time.Time
	var lastActiveAt time.Time

	// Retrieve the author.
	author, err := UserByID(ctx, tx, postSkeleton.AuthorUserID)
	if err != nil {
		return nil, err
	}

	// Create the initial post.
	if err := tx.Query(ctx, `
		insert into posts (
			author_user_id,
			content,
			warning
		)
		values (
			$1,
			$2,
			$3
		)
		returning id, created_at, last_active_at
	`,
		postSkeleton.AuthorUserID,
		postSkeleton.Content,
		postSkeleton.Warning,
	).Row(&postID, &createdAt, &lastActiveAt); err != nil {
		return nil, err
	}

	// Materialize the path.
	var path []uuid.UUID
	if err := tx.Query(ctx, `
		with ancestors as (
			insert into post_ancestors (
				descendant_post_id,
				ancestor_post_id,
				distance
			)
			(
				select $1::uuid, ancestor_post_id, distance + 1
				from post_ancestors
				where descendant_post_id = $2
			) union all (
				select $1, $1, 0
			)
			returning ancestor_post_id, distance
		)
		select ancestor_post_id
		from ancestors
		where distance > 0
		order by distance
	`, postID, postSkeleton.ParentPostID).Rows(func(rows pgx.Rows) error {
		var parentID uuid.UUID
		if err := rows.Scan(&parentID); err != nil {
			return err
		}
		path = append(path, parentID)
		return nil
	}); err != nil {
		return nil, err
	}

	// Update the last_active_at of all posts along the path.
	if _, err := tx.Query(ctx, `
		update posts
		set last_active_at = now()
		where id = any(
			select ancestor_post_id
			from post_ancestors
			where
				descendant_post_id = $1
				and distance > 0
		)
	`, postID).Exec(); err != nil {
		return nil, err
	}

	if len(path) == 0 {
		// If there is no parent post, we will publish to the user's topic by default, publicly.
		if err := publishUserTopic(ctx, tx, pbsb, postID, author.ID, author.ID, publishOpts{Private: false}); err != nil {
			return nil, err
		}
	} else {
		// If there is a parent post, we will publish to the parent post's author's topic, privately.
		var parentAuthorUserID *uuid.UUID

		if err := tx.Query(ctx, `
			select author_user_id
			from posts
			where id = $1
		`, postSkeleton.ParentPostID).Row(&parentAuthorUserID); err != nil {
			return nil, err
		}

		if parentAuthorUserID != nil {
			if err := publishUserTopic(ctx, tx, pbsb, postID, *parentAuthorUserID, author.ID, publishOpts{Private: true}); err != nil {
				return nil, err
			}
		}

		// Publish updates to all posts along the path.
		tx.OnCommit(func(ctx context.Context) {
			for _, postID := range path {
				if err := notifyPostDescendants(ctx, pbsb, postID); err != nil {
					log.Err(err).Msg("notifyPostDescendants: failed to publish")
				}
			}
		})
	}

	return &Post{
		ID:           postID,
		CreatedAt:    createdAt,
		LastActiveAt: lastActiveAt,
		Author:       author,
		Warning:      postSkeleton.Warning,
		Content:      &postSkeleton.Content,
		ParentPostID: postSkeleton.ParentPostID,
		ParentNextPageToken: PostChildrenNextPageToken{
			LastActiveAt: lastActiveAt,
			CreatedAt:    createdAt,
			ID:           postID,
		},
	}, nil
}

func DeletePost(ctx context.Context, tx *Tx, postID uuid.UUID) error {
	// We don't actually delete the post, we just turn it into a tombstone.
	if _, err := tx.Query(ctx, `
		update posts
		set
			deleted_at = now(),
			content = null,
			warning = null
		where
			id = $1 and
			deleted_at is null
	`, postID).Exec(); err != nil {
		return err
	}

	// But we do delete all publications of it.
	if _, err := tx.Query(ctx, `
		delete from publications
		where post_id = $1
	`, postID).Exec(); err != nil {
		return err
	}

	return nil
}
