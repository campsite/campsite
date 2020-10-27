package services

import (
	"context"
	"time"

	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/env"
	"campsite.social/campsite/apiserver/security"
	"campsite.social/campsite/apiserver/types"
	"campsite.social/campsite/apiserver/types/dbtopb"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
	"github.com/jackc/pgx/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type usersServer struct {
	campsitev1.UnimplementedUsersServer
	*env.Env
}

func (ps *usersServer) GetMe(ctx context.Context, in *campsitev1.GetMeRequest) (*campsitev1.GetMeResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	var user *db.User
	if err := ps.DB.Begin(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	}, func(ctx context.Context, tx *db.Tx) error {
		var err error
		user, err = db.UserByID(ctx, tx, principal.UserID)
		if err != nil {
			return err
		}
		return nil
	}); err != nil {
		return nil, err
	}

	if user == nil {
		return nil, status.Error(codes.NotFound, "")
	}

	userpb, err := dbtopb.UserToProto(user)
	if err != nil {
		return nil, err
	}

	return &campsitev1.GetMeResponse{
		User: userpb,
	}, nil
}

func (s *usersServer) GetUser(ctx context.Context, in *campsitev1.GetUserRequest) (*campsitev1.GetUserResponse, error) {
	userID, err := types.DecodeID(in.UserId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user_id")
	}

	var user *db.User
	if err := s.DB.Begin(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	}, func(ctx context.Context, tx *db.Tx) error {
		var err error
		user, err = db.UserByID(ctx, tx, userID)
		if err != nil {
			return err
		}
		return nil
	}); err != nil {
		return nil, err
	}

	if user == nil {
		return nil, status.Error(codes.NotFound, "")
	}

	userpb, err := dbtopb.UserToProto(user)
	if err != nil {
		return nil, err
	}

	return &campsitev1.GetUserResponse{
		User: userpb,
	}, nil
}

func (s *usersServer) GetFeed(ctx context.Context, in *campsitev1.GetFeedRequest) (*campsitev1.GetFeedResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	pageToken := db.FeedPageToken{
		PublishedAt: time.Now(),
		Direction:   db.PageDirectionOlder,
	}
	if in.PageToken != "" {
		var err error
		pageToken, err = dbtopb.DecodeFeedPageToken(in.PageToken)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "page_token")
		}
	}

	if in.Wait {
		if err := db.WaitForFeed(ctx, s.DB, s.PubSub, principal.UserID, pageToken); err != nil {
			return nil, err
		}
	}

	var pubs []*db.Publication
	var pageTokenPair db.FeedPageTokenPair
	if err := s.DB.Begin(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	}, func(ctx context.Context, tx *db.Tx) error {
		var err error
		pubs, pageTokenPair, err = db.Feed(ctx, tx, principal.UserID, int(in.ParentDepth), pageToken, int(in.Limit))
		if err != nil {
			return err
		}
		return nil
	}); err != nil {
		return nil, err
	}

	pubPbs := make([]*campsitev1.Publication, len(pubs))
	for i, pub := range pubs {
		var err error
		pubPbs[i], err = dbtopb.PublicationToProto(pub)
		if err != nil {
			return nil, err
		}
	}

	resp := &campsitev1.GetFeedResponse{
		Publications: pubPbs,
	}

	protoPageTokenPair, err := dbtopb.EncodeFeedPageTokenPair(pageTokenPair)
	if err != nil {
		return nil, err
	}
	resp.PageTokens = protoPageTokenPair

	return resp, nil
}

func NewUsersServer(env *env.Env) campsitev1.UsersServer {
	return &usersServer{Env: env}
}
