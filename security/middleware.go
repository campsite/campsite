package security

import (
	"context"
	"encoding/base64"

	"campsite.rocks/campsite/env"
	"github.com/google/uuid"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"github.com/jackc/pgx/v4"
	"github.com/pkg/errors"
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

func MakeAuthFunc(env *env.Env) grpc_auth.AuthFunc {
	return func(ctx context.Context) (context.Context, error) {
		principal, err := findPrincipalFromContext(ctx, env)
		if err != nil {
			return ctx, err
		}
		return context.WithValue(ctx, principalKey{}, principal), nil
	}
}
