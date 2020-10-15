package security

import (
	"context"

	"github.com/google/uuid"
)

// A Principal identifies a logged in user, including their OAuth scopes, if any.
type Principal struct {
	SessionID uuid.UUID
	UserID    uuid.UUID
	Scopes    []string
}

type principalKey struct{}

// PrincipalFromContext retrieves the current authenticated principal from the context.
// If nil is returned, there is no logged in user.
func PrincipalFromContext(ctx context.Context) *Principal {
	return ctx.Value(principalKey{}).(*Principal)
}
