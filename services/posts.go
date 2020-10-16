package services

import (
	"context"
	"time"

	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"campsite.rocks/campsite/types"
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
	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	postID, err := types.DecodeID(in.Id)
	if err != nil {
		return nil, status.Error(codes.NotFound, "")
	}

	posts, err := db.PostsByID(ctx, tx, []uuid.UUID{postID}, int(in.ParentDepth))
	if err != nil {
		return nil, err
	}

	if len(posts) == 0 {
		return nil, status.Error(codes.NotFound, "")
	}

	return &campsitev1.GetPostResponse{
		Post: posts[postID],
	}, nil
}

func (ps *postsServer) CreatePost(ctx context.Context, in *campsitev1.CreatePostRequest) (*campsitev1.CreatePostResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
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
			return nil, status.Error(codes.InvalidArgument, "parent_post_id")
		}
		parentPostID = &postID
	}

	var warning *string
	if in.Warning != nil {
		warning = &in.Warning.Value
	}

	post, err := db.CreatePost(ctx, tx, &db.PostPrototype{
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

	return &campsitev1.CreatePostResponse{
		Post: post,
	}, nil
}

func (ps *postsServer) GetPostChildren(ctx context.Context, in *campsitev1.GetPostChildrenRequest) (*campsitev1.GetPostChildrenResponse, error) {
	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	postID, err := types.DecodeID(in.PostId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "")
	}

	pageToken := types.PageToken{
		CreatedAt: time.Now(),
	}
	if in.PageToken != "" {
		var err error
		pageToken, err = types.DecodePageToken(in.PageToken)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "page_token")
		}
	}

	children, nextPageToken, err := db.PostChildrenByID(ctx, tx, postID, int(in.ChildDepth), pageToken, int(in.Limit))
	if err != nil {
		return nil, err
	}

	resp := &campsitev1.GetPostChildrenResponse{
		Posts: children,
	}

	if nextPageToken != nil {
		pt, err := types.EncodePageToken(*nextPageToken)
		if err != nil {
			return nil, err
		}
		resp.NextPageToken = pt
	}

	return resp, nil
}

func NewPostsServer(env *env.Env) campsitev1.PostsServer {
	return &postsServer{Env: env}
}
