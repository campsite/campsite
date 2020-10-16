package db

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
)

type User struct {
	ID   uuid.UUID
	Name string
}

func UsersByID(ctx context.Context, tx *Tx, userIDs []uuid.UUID) (map[uuid.UUID]*User, error) {
	users := map[uuid.UUID]*User{}
	if err := tx.Query(ctx, `
		select id, name
		from users
		where id = any($1)
	`, userIDs).Rows(func(rows pgx.Rows) error {
		u := &User{}
		if err := rows.Scan(&u.ID, &u.Name); err != nil {
			return err
		}
		users[u.ID] = u
		return nil
	}); err != nil {
		return nil, err
	}
	return users, nil
}

func UserByID(ctx context.Context, tx *Tx, userID uuid.UUID) (*User, error) {
	users, err := UsersByID(ctx, tx, []uuid.UUID{userID})
	if err != nil {
		return nil, err
	}
	return users[userID], nil
}
