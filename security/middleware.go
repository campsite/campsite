package security

import (
	"context"
	"encoding/base64"
	"strings"

	"campsite.rocks/campsite/env"
	"github.com/google/uuid"
	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"github.com/jackc/pgx/v4"
	"github.com/pkg/errors"
	"google.golang.org/grpc"
)

func findPrincipalFromContext(ctx context.Context, env *env.Env) (*Principal, error) {
	rawToken, err := grpc_auth.AuthFromMD(ctx, "bearer")
	if err != nil {
		return nil, err
	}

	rawSessionID, err := base64.RawURLEncoding.DecodeString(rawToken)
	if err != nil {
		return nil, nil
	}

	sessionID, err := uuid.FromBytes(rawSessionID)
	if err != nil {
		return nil, nil
	}

	var userID uuid.UUID
	var scopes []string

	if err := env.DB.QueryRow(ctx, `
		update sessions
		set last_active_at = now()
		where id = $1
		returning user_id, scopes
	`, sessionID).Scan(&userID, &scopes); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	return &Principal{
		SessionID: sessionID,
		UserID:    userID,
		Scopes:    scopes,
	}, nil
}

const authenticatedMethodPrefix = "/campsite."

func MakeStreamServerInterceptor(env *env.Env) grpc.StreamServerInterceptor {
	return func(srv interface{}, stream grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
		if strings.HasPrefix(info.FullMethod, authenticatedMethodPrefix) {
			principal, err := findPrincipalFromContext(stream.Context(), env)
			if err != nil {
				return err
			}

			s := grpc_middleware.WrapServerStream(stream)
			s.WrappedContext = context.WithValue(stream.Context(), principalKey{}, principal)
			stream = s
		}

		return handler(srv, stream)
	}
}

func MakeUnaryServerInterceptor(env *env.Env) grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
		if strings.HasPrefix(info.FullMethod, authenticatedMethodPrefix) {
			principal, err := findPrincipalFromContext(ctx, env)
			if err != nil {
				return nil, err
			}
			ctx = context.WithValue(ctx, principalKey{}, principal)
		}

		return handler(ctx, req)
	}
}
