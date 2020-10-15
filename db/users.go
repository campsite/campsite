package db

import (
	"context"

	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
)

func UsersByID(ctx context.Context, tx pgx.Tx, userIDs []uuid.UUID) (map[uuid.UUID]*campsitev1.User, error) {
	users := map[uuid.UUID]*campsitev1.User{}

	rows, err := tx.Query(ctx, `
		select id, name
		from users
		where id = any($1)
	`, userIDs)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var userID uuid.UUID
		var name string
		if err := rows.Scan(&userID, &name); err != nil {
			return nil, err
		}

		users[userID] = &campsitev1.User{
			Id:   types.EncodeID(userID),
			Name: name,
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

func UserByID(ctx context.Context, tx pgx.Tx, userID uuid.UUID) (*campsitev1.User, error) {
	users, err := UsersByID(ctx, tx, []uuid.UUID{userID})
	if err != nil {
		return nil, err
	}
	return users[userID], nil
}
