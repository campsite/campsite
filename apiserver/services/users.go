package services

import (
	"context"

	"campsite.rocks/campsite/apiserver/db"
	"campsite.rocks/campsite/apiserver/env"
	"campsite.rocks/campsite/apiserver/security"
	"campsite.rocks/campsite/apiserver/types"
	"campsite.rocks/campsite/apiserver/types/dbtopb"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
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

func (ps *usersServer) GetUser(ctx context.Context, in *campsitev1.GetUserRequest) (*campsitev1.GetUserResponse, error) {
	userID, err := types.DecodeID(in.UserId)
	if err != nil {
		return nil, status.Error(codes.NotFound, "user_id")
	}

	var user *db.User
	if err := ps.DB.Begin(ctx, pgx.TxOptions{
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

func NewUsersServer(env *env.Env) campsitev1.UsersServer {
	return &usersServer{Env: env}
}
