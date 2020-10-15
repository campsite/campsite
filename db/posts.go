package db

import (
	"context"
	"time"

	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/types"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/wrappers"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
	"google.golang.org/protobuf/types/known/wrapperspb"
)

type deferredLoadsForPost struct {
	usersToFetch map[uuid.UUID][]*campsitev1.User
}

// basePostsByID only fetches records from the posts table. This is to allow for recursive lookup of parent posts in one go without running N+1 queries.
func basePostsByID(ctx context.Context, tx pgx.Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*campsitev1.Post, *deferredLoadsForPost, error) {
	posts := map[uuid.UUID]*campsitev1.Post{}

	deferred := &deferredLoadsForPost{
		usersToFetch: map[uuid.UUID][]*campsitev1.User{},
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
			var postID uuid.UUID
			var createdAt time.Time
			var editedAt *time.Time
			var deletedAt *time.Time
			var content *string
			var warning *string
			var authorUserID *uuid.UUID
			var parentPostID *uuid.UUID
			var numChildren int
			if err := rows.Scan(&postID, &createdAt, &editedAt, &deletedAt, &content, &warning, &authorUserID, &parentPostID, &numChildren); err != nil {
				return err
			}

			ptypesCreatedAt, err := ptypes.TimestampProto(createdAt)
			if err != nil {
				return err
			}

			var ptypesEditedAt *timestamppb.Timestamp
			if editedAt != nil {
				var err error
				ptypesEditedAt, err = ptypes.TimestampProto(*editedAt)
				if err != nil {
					return err
				}
			}

			var ptypesDeletedAt *timestamppb.Timestamp
			if deletedAt != nil {
				var err error
				ptypesDeletedAt, err = ptypes.TimestampProto(*deletedAt)
				if err != nil {
					return err
				}
			}

			var author *campsitev1.User
			if authorUserID != nil {
				author = &campsitev1.User{
					Id: types.EncodeID(*authorUserID),
				}
				deferred.usersToFetch[*authorUserID] = append(deferred.usersToFetch[*authorUserID], author)
			}

			var ptypesContent *wrappers.StringValue
			if content != nil {
				ptypesContent = &wrapperspb.StringValue{Value: *content}
			}

			var ptypesWarning *wrappers.StringValue
			if warning != nil {
				ptypesWarning = &wrapperspb.StringValue{Value: *warning}
			}

			var ptypesParentPostID *wrappers.StringValue
			if parentPostID != nil {
				ptypesParentPostID = &wrappers.StringValue{Value: types.EncodeID(*parentPostID)}
			}

			pt, err := types.EncodePageToken(types.PageToken{
				ID:        postID,
				CreatedAt: createdAt,
			})
			if err != nil {
				return err
			}

			posts[postID] = &campsitev1.Post{
				Id:                    types.EncodeID(postID),
				CreatedAt:             ptypesCreatedAt,
				EditedAt:              ptypesEditedAt,
				DeletedAt:             ptypesDeletedAt,
				Content:               ptypesContent,
				Warning:               ptypesWarning,
				Author:                author,
				ParentPostId:          ptypesParentPostID,
				ChildrenNextPageToken: pt,
				NumChildren:           int32(numChildren),
			}
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

func PostsByID(ctx context.Context, tx pgx.Tx, ids []uuid.UUID, parentDepth int) (map[uuid.UUID]*campsitev1.Post, error) {
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
			proto.Merge(u, users[userID])
		}
	}

	return posts, nil
}

func PostChildrenByID(ctx context.Context, tx pgx.Tx, postID uuid.UUID, childDepth int, pageToken types.PageToken, limit int) ([]*campsitev1.Post, *types.PageToken, error) {
	type postTreeNode struct {
		id        uuid.UUID
		post      *campsitev1.Post
		createdAt time.Time
		children  []*postTreeNode
	}

	var rootPosts []*postTreeNode

	postTreeNodesByID := map[uuid.UUID]*postTreeNode{}
	var postIDs []uuid.UUID

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
			var postID uuid.UUID
			var createdAt time.Time
			var path []uuid.UUID

			if err := rows.Scan(&postID, &createdAt, &path); err != nil {
				return err
			}

			postIDs = append(postIDs, postID)

			node := &postTreeNode{
				id:        postID,
				createdAt: createdAt,
				post: &campsitev1.Post{
					Id: types.EncodeID(postID),
				},
			}
			postTreeNodesByID[postID] = node

			if len(path) == 0 {
				rootPosts = append(rootPosts, node)
			} else {
				// Rows are retrieved in level-order traversal, so we can materialize the tree in the order we receive the nodes.
				parentNode := postTreeNodesByID[path[len(path)-1]]
				parentNode.children = append(parentNode.children, node)
				parentNode.post.Children = append(parentNode.post.Children, node.post)
			}
		}

		if err := rows.Err(); err != nil {
			return err
		}

		return nil
	}(); err != nil {
		return nil, nil, err
	}

	posts, err := PostsByID(ctx, tx, postIDs, 0)
	if err != nil {
		return nil, nil, err
	}

	// Fill in the post tree.
	for postID, node := range postTreeNodesByID {
		proto.Merge(node.post, posts[postID])
		if len(node.children) < limit {
			// Blank the next page tokens if we are under the limit.
			node.post.ChildrenNextPageToken = ""
		}
	}

	childPosts := make([]*campsitev1.Post, len(rootPosts))
	for i, rootPost := range rootPosts {
		childPosts[i] = rootPost.post
	}

	var nextPageToken *types.PageToken
	if len(rootPosts) >= limit {
		nextPageToken = &types.PageToken{
			CreatedAt: rootPosts[len(rootPosts)-1].createdAt,
			ID:        rootPosts[len(rootPosts)-1].id,
		}
	}

	return childPosts, nextPageToken, nil
}

type PostPrototype struct {
	AuthorUserID uuid.UUID
	Content      string
	Warning      *string
	ParentPostID *uuid.UUID
}

func CreatePost(ctx context.Context, tx pgx.Tx, postProto *PostPrototype) (*campsitev1.Post, error) {
	var postID uuid.UUID
	var createdAt time.Time

	// Retrieve the author.
	author, err := UserByID(ctx, tx, postProto.AuthorUserID)
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
		postProto.AuthorUserID,
		postProto.ParentPostID,
		postProto.Content,
		postProto.Warning,
	).Scan(&postID, &createdAt); err != nil {
		return nil, err
	}

	ptypesCreatedAt, err := ptypes.TimestampProto(createdAt)
	if err != nil {
		return nil, err
	}

	var ptypesWarning *wrappers.StringValue
	if postProto.Warning != nil {
		ptypesWarning = &wrappers.StringValue{Value: *postProto.Warning}
	}

	var ptypesParentPostID *wrappers.StringValue
	if postProto.ParentPostID != nil {
		ptypesParentPostID = &wrappers.StringValue{Value: types.EncodeID(*postProto.ParentPostID)}
	}

	pt, err := types.EncodePageToken(types.PageToken{
		ID:        postID,
		CreatedAt: createdAt,
	})
	if err != nil {
		return nil, err
	}

	return &campsitev1.Post{
		Id:                    types.EncodeID(postID),
		CreatedAt:             ptypesCreatedAt,
		Author:                author,
		Warning:               ptypesWarning,
		Content:               &wrappers.StringValue{Value: postProto.Content},
		ChildrenNextPageToken: pt,
		ParentPostId:          ptypesParentPostID,
	}, nil
}
