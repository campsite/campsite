package db

import (
	"context"
	"time"

	"campsite.rocks/campsite/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
)

type Publication struct {
	PublishedAt time.Time
	Publisher   *User
	Post        *Post
}

func Feed(ctx context.Context, tx pgx.Tx, userID uuid.UUID, parentDepth int, pageToken types.PageToken, limit int) ([]*Publication, *types.PageToken, error) {
	var pubs []*Publication
	var postIDs []uuid.UUID
	var publisherIDs []uuid.UUID
	postsByID := map[uuid.UUID]*Post{}

	if err := func() error {
		rows, err := tx.Query(ctx, `
			select
				post_id, published_at, publisher_user_id
			from
				publications
			where
				(
					topic_id = any(
						select
							subscriptions.topic_id
						from
							subscriptions
						where
							subscriptions.user_id = $1
					) or
					topic_id = $1 or
					topic_id = (
						select private_topic_id
						from users
						where id = $1
					)
				) and (
					(published_at < $2) or
					(published_at = $2 and post_id > $3)
				)
			order by
				published_at desc, post_id
			limit $4
		`, userID, pageToken.CreatedAt, pageToken.ID, limit)
		if err != nil {
			return err
		}
		defer rows.Close()

		for rows.Next() {
			pub := &Publication{
				Post:      &Post{},
				Publisher: &User{},
			}
			if err := rows.Scan(&pub.Post.ID, &pub.PublishedAt, &pub.Publisher.ID); err != nil {
				return err
			}

			pubs = append(pubs, pub)
			postIDs = append(postIDs, pub.Post.ID)
			publisherIDs = append(publisherIDs, pub.Publisher.ID)
			postsByID[pub.Post.ID] = pub.Post
		}

		if err := rows.Err(); err != nil {
			return err
		}

		return nil
	}(); err != nil {
		return nil, nil, err
	}

	posts, err := PostsByID(ctx, tx, postIDs, parentDepth)
	if err != nil {
		return nil, nil, err
	}

	for _, postID := range postIDs {
		*postsByID[postID] = *posts[postID]
	}

	publishers, err := UsersByID(ctx, tx, publisherIDs)
	if err != nil {
		return nil, nil, err
	}

	for _, pub := range pubs {
		*pub.Publisher = *publishers[pub.Publisher.ID]
	}

	var nextPageToken *types.PageToken
	if len(pubs) >= limit {
		nextPageToken = &types.PageToken{
			CreatedAt: pubs[len(pubs)-1].PublishedAt,
			ID:        pubs[len(pubs)-1].Post.ID,
		}
	}

	return pubs, nextPageToken, nil
}
