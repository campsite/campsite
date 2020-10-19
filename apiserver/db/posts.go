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
	ID        uuid.UUID
	CreatedAt time.Time
	EditedAt  *time.Time
	DeletedAt *time.Time
	Content   *string
	Warning   *string

	Author *User

	ParentPostID *uuid.UUID
	ParentPost   *Post

	Children              []*Post
	ChildrenPageTokenPair types.PageTokenPair
	NumChildren           int
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
			content,
			warning,
			author_user_id,
			parent_post_id,
			(select count(1) from posts p where p.parent_post_id = posts.id)
		from
			posts
		where
			id = any($1)
	`, ids).Rows(func(rows pgx.Rows) error {
		p := &Post{}

		var authorUserID *uuid.UUID
		if err := rows.Scan(&p.ID, &p.CreatedAt, &p.EditedAt, &p.DeletedAt, &p.Content, &p.Warning, &authorUserID, &p.ParentPostID, &p.NumChildren); err != nil {
			return err
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
				id,
				(
					with recursive parents (post_id, path) as
					(
						select
							posts.id,
							array[]::uuid[]
						union all
						select
							p.parent_post_id,
							parents.path || array[p.parent_post_id]
						from
							parents,
							posts p
						where
							p.id = parents.post_id and
							p.parent_post_id is not null and
							coalesce(array_length(parents.path, 1), 0) < $2
					)
					select
						-- TODO: pgx driver workaround: https://github.com/jackc/pgtype/issues/68
						case when path = array[]::uuid[] then null else path end
					from
						parents
					order by
						coalesce(array_length(path, 1), 0) desc
					limit 1
				)
			from posts
			where id = any($1)
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

func PostChildrenByID(ctx context.Context, tx *Tx, postID uuid.UUID, childDepth int, pageToken types.PageToken, limit int) ([]*Post, types.PageTokenPair, error) {
	var rootPosts []*Post

	childPostsByID := map[uuid.UUID]*Post{}
	var childPostIDs []uuid.UUID

	if err := tx.Query(ctx, `
		with recursive children (post_id, created_at, path) as
		(
			(
				select
					id,
					created_at,
					array[]::uuid[]
				from
					posts
				where
					parent_post_id = $1 and (
						case
							when $4 = -1 then (
								(created_at < $2) or
								(created_at = $2 and id > $3)
							)
							when $4 = 1 then (
								(created_at > $2) or
								(created_at = $2 and id < $3)
							)
							else false
						end
					)
				order by
					created_at desc, id
				limit $6
			)
			union all
			(
				select
					p.id,
					p.created_at,
					children.path || array[p.parent_post_id]
				from
					children,
					posts p
				where
					p.parent_post_id = children.post_id and
					coalesce(array_length(children.path, 1), 0) < $5
				order by
					p.created_at desc, p.id
				limit $6
			)
		)
		select
			post_id,
			created_at,
			-- TODO: pgx driver workaround: https://github.com/jackc/pgtype/issues/68
			case when path = array[]::uuid[] then null else path end
		from
			children
		order by
			-- TODO: pgx driver workaround: https://github.com/jackc/pgtype/issues/68
			coalesce(path, '{}'),
			created_at desc,
			post_id
	`, postID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction, childDepth, limit).Rows(func(rows pgx.Rows) error {
		child := &Post{}
		var path []uuid.UUID

		if err := rows.Scan(&child.ID, &child.CreatedAt, &path); err != nil {
			return err
		}

		childPostIDs = append(childPostIDs, child.ID)
		childPostsByID[child.ID] = child

		if len(path) == 0 {
			rootPosts = append(rootPosts, child)
		} else {
			// Rows are retrieved in level-order traversal, so we can materialize the tree in the order we receive the nodes.
			parentNode := childPostsByID[path[len(path)-1]]
			parentNode.Children = append(parentNode.Children, child)
		}
		return nil
	}); err != nil {
		return nil, types.PageTokenPair{}, err
	}

	posts, err := PostsByID(ctx, tx, childPostIDs, 0)
	if err != nil {
		return nil, types.PageTokenPair{}, err
	}

	// Fill in the post tree.
	for _, child := range childPostsByID {
		// We have to preserve the children because otherwise they will be overridden by copying the fetched post in.
		children := child.Children
		*child = *posts[child.ID]
		child.Children = children

		var nextPageToken *types.PageToken
		if len(children) >= limit {
			nextPageToken = &types.PageToken{
				CreatedAt: children[len(children)-1].CreatedAt,
				ID:        children[len(children)-1].ID,
				Direction: types.PageDirectionOlder,
			}
		}

		var prevPageToken *types.PageToken
		if len(children) > 0 {
			prevPageToken = &types.PageToken{
				CreatedAt: children[0].CreatedAt,
				ID:        children[0].ID,
				Direction: types.PageDirectionNewer,
			}
		}

		child.ChildrenPageTokenPair = types.PageTokenPair{
			Next: nextPageToken,
			Prev: prevPageToken,
		}
	}

	childPosts := make([]*Post, len(rootPosts))
	for i, rootPost := range rootPosts {
		childPosts[i] = rootPost
	}

	var ptp types.PageTokenPair
	if len(rootPosts) > 0 {
		if len(rootPosts) >= limit || pageToken.Direction == types.PageDirectionNewer {
			ptp.Next = &types.PageToken{
				CreatedAt: rootPosts[len(rootPosts)-1].CreatedAt,
				ID:        rootPosts[len(rootPosts)-1].ID,
				Direction: types.PageDirectionOlder,
			}
		}

		ptp.Prev = &types.PageToken{
			CreatedAt: rootPosts[0].CreatedAt,
			ID:        rootPosts[0].ID,
			Direction: types.PageDirectionNewer,
		}
	} else {
		ptp.Prev = &types.PageToken{
			CreatedAt: pageToken.CreatedAt,
			ID:        pageToken.ID,
			Direction: types.PageDirectionNewer,
		}
	}

	return childPosts, ptp, nil
}

func notifyParentPost(ctx context.Context, pbsb *pubsub.PubSub, parentPostID uuid.UUID) error {
	if err := pbsb.Publish(ctx, "postchildren:"+types.EncodeID(parentPostID), []byte{}); err != nil {
		return err
	}
	return nil
}

func WaitForPostChildren(ctx context.Context, db *DB, pbsb *pubsub.PubSub, postID uuid.UUID, pageToken types.PageToken) error {
	// We must subscribe before we check hasNewer, otherwise we have a race condition.
	sub, err := pbsb.Subscribe(ctx, "postchildren:"+types.EncodeID(postID))
	if err != nil {
		return err
	}
	defer sub.Unsubscribe(ctx)

	for {
		var hasNewer bool
		if err := db.Query(ctx, `
			select exists(
				select 1
				from posts
				where
					parent_post_id = $1 and (
						case
							when $4 = -1 then (
								(created_at < $2) or
								(created_at = $2 and id > $3)
							)
							when $4 = 1 then (
								(created_at > $2) or
								(created_at = $2 and id < $3)
							)
							else false
						end
					)
			)
		`, postID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction).Row(&hasNewer); err != nil {
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

type PostSkeleton struct {
	AuthorUserID uuid.UUID
	Content      string
	Warning      *string
	ParentPostID *uuid.UUID
}

func CreatePost(ctx context.Context, tx *Tx, pbsb *pubsub.PubSub, postSkeleton *PostSkeleton) (*Post, error) {
	var postID uuid.UUID
	var createdAt time.Time

	// Retrieve the author.
	author, err := UserByID(ctx, tx, postSkeleton.AuthorUserID)
	if err != nil {
		return nil, err
	}

	// Create the initial post.
	if err := tx.Query(ctx, `
		insert into posts (
			author_user_id,
			parent_post_id,
			content,
			warning
		)
		values (
			$1,
			$2,
			$3,
			$4
		)
		returning id, created_at
	`,
		postSkeleton.AuthorUserID,
		postSkeleton.ParentPostID,
		postSkeleton.Content,
		postSkeleton.Warning,
	).Row(&postID, &createdAt); err != nil {
		return nil, err
	}

	if postSkeleton.ParentPostID == nil {
		// If there is no parent post, we will publish to the user's topic by default, publicly.
		if err := publishUserTopic(ctx, tx, pbsb, postID, author.ID, author.ID, publishOpts{Private: false}); err != nil {
			return nil, err
		}
	} else {
		// If there is a parent post, we will publish to the parent post's author's topic, privately.
		var parentAuthorUserID *uuid.UUID

		if err := tx.Query(ctx, `
			select posts.author_user_id
			from posts
			where posts.id = (
				select p2.parent_post_id
				from posts p2
				where p2.id = $1
			)
		`, postID).Row(&parentAuthorUserID); err != nil {
			return nil, err
		}

		if parentAuthorUserID != nil {
			if err := publishUserTopic(ctx, tx, pbsb, postID, *parentAuthorUserID, author.ID, publishOpts{Private: true}); err != nil {
				return nil, err
			}
		}

		tx.OnCommit(func(ctx context.Context) {
			if err := notifyParentPost(ctx, pbsb, *postSkeleton.ParentPostID); err != nil {
				log.Err(err).Msg("notifyParentPost: failed to publish")
			}
		})
	}

	return &Post{
		ID:           postID,
		CreatedAt:    createdAt,
		Author:       author,
		Warning:      postSkeleton.Warning,
		Content:      &postSkeleton.Content,
		ParentPostID: postSkeleton.ParentPostID,
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
