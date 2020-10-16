package db

import (
	"context"
	"time"

	"campsite.rocks/campsite/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
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
	ChildrenNextPageToken *types.PageToken
	NumChildren           int
}

type deferredLoadsForPost struct {
	usersToFetch map[uuid.UUID][]*User
}

// basePostsByID only fetches records from the posts table. This is to allow for recursive lookup of parent posts in one go without running N+1 queries.
func basePostsByID(ctx context.Context, tx pgx.Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*Post, *deferredLoadsForPost, error) {
	posts := map[uuid.UUID]*Post{}

	deferred := &deferredLoadsForPost{
		usersToFetch: map[uuid.UUID][]*User{},
	}

	// Fetch the posts.
	if err := func() error {
		rows, err := tx.Query(ctx, `
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
		`, ids)
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
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

			p.ChildrenNextPageToken = &types.PageToken{
				ID:        p.ID,
				CreatedAt: p.CreatedAt,
			}

			posts[p.ID] = p
		}

		if err := rows.Err(); err != nil {
			return err
		}

		return nil
	}(); err != nil {
		return nil, nil, err
	}

	// Fetch the parents, if we have any.
	if parentDepth > 0 {
		paths := make(map[uuid.UUID][]uuid.UUID, len(ids))
		var postsToFetch []uuid.UUID

		if err := func() error {
			rows, err := tx.Query(ctx, `
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
			`, ids, parentDepth)
			if err != nil {
				return err
			}
			defer rows.Close()

			for rows.Next() {
				var postID uuid.UUID
				var path []uuid.UUID
				if err := rows.Scan(&postID, &path); err != nil {
					return err
				}

				paths[postID] = path
				postsToFetch = append(postsToFetch, path...)
			}

			if err := rows.Err(); err != nil {
				return err
			}

			return nil
		}(); err != nil {
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

func PostsByID(ctx context.Context, tx pgx.Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*Post, error) {
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
			*users[userID] = *u
		}
	}

	return posts, nil
}

func PostChildrenByID(ctx context.Context, tx pgx.Tx, postID uuid.UUID, childDepth int, pageToken types.PageToken, limit int) ([]*Post, *types.PageToken, error) {
	var rootPosts []*Post

	childPostsByID := map[uuid.UUID]*Post{}
	var childPostIDs []uuid.UUID

	if err := func() error {
		rows, err := tx.Query(ctx, `
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
						parent_post_id = $1 and
						(
							(created_at < $2) or
							(created_at = $2 and id > $3)
						)
					order by
						created_at desc, id
					limit $5
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
						coalesce(array_length(children.path, 1), 0) < $4
					order by
						p.created_at desc, p.id
					limit $5
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
		`, postID, pageToken.CreatedAt, pageToken.ID, childDepth, limit)
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
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
		}

		if err := rows.Err(); err != nil {
			return err
		}

		return nil
	}(); err != nil {
		return nil, nil, err
	}

	posts, err := PostsByID(ctx, tx, childPostIDs, 0)
	if err != nil {
		return nil, nil, err
	}

	// Fill in the post tree.
	for _, child := range childPostsByID {
		// We have to preserve the children because otherwise they will be overridden by copying the fetched post in.
		children := child.Children
		*child = *posts[child.ID]
		child.Children = children

		if len(child.Children) < limit {
			// Blank the next page tokens if we are under the limit.
			child.ChildrenNextPageToken = nil
		}
	}

	childPosts := make([]*Post, len(rootPosts))
	for i, rootPost := range rootPosts {
		childPosts[i] = rootPost
	}

	var nextPageToken *types.PageToken
	if len(rootPosts) >= limit {
		nextPageToken = &types.PageToken{
			CreatedAt: rootPosts[len(rootPosts)-1].CreatedAt,
			ID:        rootPosts[len(rootPosts)-1].ID,
		}
	}

	return childPosts, nextPageToken, nil
}

type PostSkeleton struct {
	AuthorUserID uuid.UUID
	Content      string
	Warning      *string
	ParentPostID *uuid.UUID
}

func CreatePost(ctx context.Context, tx pgx.Tx, postSkeleton *PostSkeleton) (*Post, error) {
	var postID uuid.UUID
	var createdAt time.Time

	// Retrieve the author.
	author, err := UserByID(ctx, tx, postSkeleton.AuthorUserID)
	if err != nil {
		return nil, err
	}

	// Create the initial post.
	if err := tx.QueryRow(ctx, `
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
	).Scan(&postID, &createdAt); err != nil {
		return nil, err
	}

	if postSkeleton.ParentPostID == nil {
		// If there is no parent post, we will publish to the user's topic by default.
		if _, err := tx.Exec(ctx, `
			insert into publishes (
				post_id,
				topic_id,
				publisher_user_id
			)
			select
				$1,
				$2,
				$2
		`, postID, author.ID); err != nil {
			return nil, err
		}
	} else {
		// If there is a parent post, we will publish to the parent post's author's private topic.
		// TODO: What if the post author is null?
		if _, err := tx.Exec(ctx, `
			insert into publishes (
				post_id,
				topic_id,
				publisher_user_id
			)
			select
				$1,
				(
					select private_topic_id
					from users
					where users.id = (
						select posts.author_user_id
						from posts
						where posts.id = (
							select p2.parent_post_id
							from posts p2
							where p2.id = $1
						)
					)
				),
				$2
		`, postID, author.ID); err != nil {
			return nil, err
		}
	}

	return &Post{
		ID:        postID,
		CreatedAt: createdAt,
		Author:    author,
		Warning:   postSkeleton.Warning,
		Content:   &postSkeleton.Content,
		ChildrenNextPageToken: &types.PageToken{
			ID:        postID,
			CreatedAt: createdAt,
		},
		ParentPostID: postSkeleton.ParentPostID,
	}, nil
}

func DeletePost(ctx context.Context, tx pgx.Tx, postID uuid.UUID) error {
	// We don't actually delete the post, we just turn it into a tombstone.
	if _, err := tx.Exec(ctx, `
		update posts
		set
			deleted_at = now(),
			content = null,
			warning = null
		where
			id = $1 and
			deleted_at is null
	`, postID); err != nil {
		return err
	}
	return nil
}
