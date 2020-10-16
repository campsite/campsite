package services

import (
	"context"

	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"campsite.rocks/campsite/types"
	"campsite.rocks/campsite/types/dbtopb"
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

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	user, err := db.UserByID(ctx, tx, principal.UserID)
	if err != nil {
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

	tx, err := ps.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	user, err := db.UserByID(ctx, tx, userID)
	if err != nil {
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
