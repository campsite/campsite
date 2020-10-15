package services

import (
	"context"

	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
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
		log.Error().Stack().Err(err).Msg("")
		return nil, status.Error(codes.Internal, "")
	}
	defer tx.Rollback(ctx)

	user, err := db.UserByID(ctx, tx, principal.UserID)
	if err != nil {
		log.Error().Stack().Err(err).Msg("")
		return nil, status.Error(codes.Internal, "")
	}

	if user == nil {
		return nil, status.Error(codes.NotFound, "")
	}

	return &campsitev1.GetMeResponse{
		User: user,
	}, nil
}

func NewUsersServer(env *env.Env) campsitev1.UsersServer {
	return &usersServer{Env: env}
}
