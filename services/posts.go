package services

import (
	"context"
	"time"

	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"campsite.rocks/campsite/types"
	"campsite.rocks/campsite/types/dbtopb"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type postsServer struct {
	campsitev1.UnimplementedPostsServer
	*env.Env
}

func (ps *postsServer) GetPost(ctx context.Context, in *campsitev1.GetPostRequest) (*campsitev1.GetPostResponse, error) {
	postID, err := types.DecodeID(in.PostId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	posts, err := db.PostsByID(ctx, tx, []uuid.UUID{postID}, int(in.ParentDepth))
	if err != nil {
		return nil, err
	}

	post, ok := posts[postID]
	if !ok {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	postpb, err := dbtopb.PostToProto(post)
	if err != nil {
		return nil, err
	}

	return &campsitev1.GetPostResponse{
		Post: postpb,
	}, nil
}

func (ps *postsServer) CreatePost(ctx context.Context, in *campsitev1.CreatePostRequest) (*campsitev1.CreatePostResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	var warning *string
	if in.Warning != nil {
		warning = &in.Warning.Value
	}

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	var parentPostID *uuid.UUID
	if in.ParentPostId != nil {
		postID, err := types.DecodeID(in.ParentPostId.Value)
		if err != nil {
			return nil, status.Error(codes.NotFound, "parent_post_id")
		}

		parentPostID = &postID

		// Verify the post exists.
		parentPosts, err := db.PostsByID(ctx, tx, []uuid.UUID{*parentPostID}, 0)
		if err != nil {
			return nil, err
		}

		if _, ok := parentPosts[*parentPostID]; !ok {
			return nil, status.Error(codes.NotFound, "parent_post_id")
		}
	}

	post, err := db.CreatePost(ctx, tx, ps.Nats, &db.PostSkeleton{
		AuthorUserID: principal.UserID,
		Content:      in.Content,
		Warning:      warning,
		ParentPostID: parentPostID,
	})
	if err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	postpb, err := dbtopb.PostToProto(post)
	if err != nil {
		return nil, err
	}

	return &campsitev1.CreatePostResponse{
		Post: postpb,
	}, nil
}

func (ps *postsServer) GetPostChildren(ctx context.Context, in *campsitev1.GetPostChildrenRequest) (*campsitev1.GetPostChildrenResponse, error) {
	postID, err := types.DecodeID(in.PostId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	pageToken := types.PageToken{
		CreatedAt: time.Now(),
		Direction: types.PageDirectionOlder,
	}
	if in.PageToken != "" {
		var err error
		pageToken, err = types.DecodePageToken(in.PageToken)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "page_token")
		}
	}

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	children, pageTokenPair, err := db.PostChildrenByID(ctx, tx, postID, int(in.ChildDepth), pageToken, int(in.Limit))
	if err != nil {
		return nil, err
	}

	posts := make([]*campsitev1.Post, len(children))
	for i, child := range children {
		var err error
		posts[i], err = dbtopb.PostToProto(child)
		if err != nil {
			return nil, err
		}
	}

	resp := &campsitev1.GetPostChildrenResponse{
		Posts: posts,
	}

	protoPageTokenPair, err := types.PageTokenPairToProto(pageTokenPair)
	if err != nil {
		return nil, err
	}
	resp.PageTokens = protoPageTokenPair

	return resp, nil
}

func (ps *postsServer) WaitForPostChildren(ctx context.Context, in *campsitev1.WaitForPostChildrenRequest) (*campsitev1.WaitForPostChildrenResponse, error) {
	pageToken, err := types.DecodePageToken(in.PageToken)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "page_token")
	}

	// Only allow newer pagination.
	if pageToken.Direction != types.PageDirectionNewer {
		return nil, status.Error(codes.InvalidArgument, "page_token")
	}

	postID, err := types.DecodeID(in.PostId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	if err := db.WaitForPostChildren(ctx, ps.DB, ps.Nats, postID, pageToken); err != nil {
		return nil, err
	}

	return &campsitev1.WaitForPostChildrenResponse{}, nil
}

func (ps *postsServer) DeletePost(ctx context.Context, in *campsitev1.DeletePostRequest) (*campsitev1.DeletePostResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	postID, err := types.DecodeID(in.PostId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	posts, err := db.PostsByID(ctx, tx, []uuid.UUID{postID}, 0)
	if err != nil {
		return nil, err
	}

	post, ok := posts[postID]
	if !ok {
		return nil, status.Error(codes.NotFound, "post_id")
	}

	if post.Author == nil || post.Author.ID != principal.UserID {
		return nil, status.Error(codes.PermissionDenied, "")
	}

	if err := db.DeletePost(ctx, tx, postID); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}

	return &campsitev1.DeletePostResponse{}, nil
}

func NewPostsServer(env *env.Env) campsitev1.PostsServer {
	return &postsServer{Env: env}
}
