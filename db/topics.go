package db

import (
	"context"
	"time"

	"campsite.rocks/campsite/pubsub"
	"campsite.rocks/campsite/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
)

type Publication struct {
	PublishedAt time.Time
	Publisher   *User
	Post        *Post
}

type publishOpts struct {
	Private bool
}

func publishUserTopic(ctx context.Context, tx *Tx, pbsb *pubsub.PubSub, postID uuid.UUID, userTopicID uuid.UUID, publisherUserID uuid.UUID, opts publishOpts) error {
	if _, err := tx.Query(ctx, `
		insert into publications (
			post_id,
			topic_id,
			publisher_user_id,
			private
		)
		select
			$1,
			$2,
			$3,
			$4
	`, postID, userTopicID, publisherUserID, opts.Private).Exec(); err != nil {
		return err
	}

	userIDs := []uuid.UUID{userTopicID}
	if !opts.Private {
		// Non-private posts need to be fanned out to all subscriptions.
		if err := tx.Query(ctx, `
			select user_id
			from subscriptions
			where topic_id = $1
		`, userTopicID).Rows(func(rows pgx.Rows) error {
			var userID uuid.UUID
			if err := rows.Scan(&userID); err != nil {
				return err
			}
			userIDs = append(userIDs, userID)
			return nil
		}); err != nil {
			return err
		}
	}

	// TODO: Consider running this outside a transaction/aggregating publishes.
	for _, userID := range userIDs {
		if err := pbsb.Publish(ctx, "user:"+types.EncodeID(userID), ""); err != nil {
			return err
		}
	}

	return nil
}

func WaitForFeed(ctx context.Context, db *DB, pbsb *pubsub.PubSub, userID uuid.UUID, pageToken types.PageToken) error {
	// We must subscribe before we check hasNewer, otherwise we have a race condition.
	sub, err := pbsb.Subscribe(ctx, "user:"+types.EncodeID(userID))
	if err != nil {
		return err
	}
	defer sub.Unsubscribe(ctx)

	for {
		var hasNewer bool
		if err := db.Query(ctx, `
			select exists(
				select 1
				from publications
				where
					(
						(
							topic_id = any(
								select
									subscriptions.topic_id
								from
									subscriptions
								where
									subscriptions.user_id = $1
							) and not private
						) or (
							topic_id = $1
						)
					) and (
						case
							when $4 = -1 then (
								(published_at < $2) or
								(published_at = $2 and post_id > $3)
							)
							when $4 = 1 then (
								(published_at > $2) or
								(published_at = $2 and post_id < $3)
							)
							else false
						end
					)
			)
		`, userID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction).Row(&hasNewer); err != nil {
			return err
		}

		if hasNewer {
			break
		}
		msg, err := sub.Receive(ctx)
		if err != nil {
			return err
		}

		_ = msg
	}

	return nil
}

func Feed(ctx context.Context, tx *Tx, userID uuid.UUID, parentDepth int, pageToken types.PageToken, limit int) ([]*Publication, types.PageTokenPair, error) {
	var pubs []*Publication
	var postIDs []uuid.UUID
	var publisherIDs []uuid.UUID
	postsByID := map[uuid.UUID]*Post{}

	if err := tx.Query(ctx, `
		select
			post_id, published_at, publisher_user_id
		from
			publications
		where
			(
				(
					topic_id = any(
						select
							subscriptions.topic_id
						from
							subscriptions
						where
							subscriptions.user_id = $1
					) and not private
				) or (
					topic_id = $1
				)
			) and (
				case
					when $4 = -1 then (
						(published_at < $2) or
						(published_at = $2 and post_id > $3)
					)
					when $4 = 1 then (
						(published_at > $2) or
						(published_at = $2 and post_id < $3)
					)
					else false
				end
			)
		order by
			published_at desc, post_id
		limit $5
	`, userID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction, limit).Rows(func(rows pgx.Rows) error {
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
		return nil
	}); err != nil {
		return nil, types.PageTokenPair{}, err
	}

	posts, err := PostsByID(ctx, tx, postIDs, parentDepth)
	if err != nil {
		return nil, types.PageTokenPair{}, err
	}

	for _, postID := range postIDs {
		*postsByID[postID] = *posts[postID]
	}

	publishers, err := UsersByID(ctx, tx, publisherIDs)
	if err != nil {
		return nil, types.PageTokenPair{}, err
	}

	for _, pub := range pubs {
		*pub.Publisher = *publishers[pub.Publisher.ID]
	}

	var nextPageToken *types.PageToken
	if len(pubs) >= limit || (len(pubs) > 0 && pageToken.Direction == types.PageDirectionNewer) {
		nextPageToken = &types.PageToken{
			CreatedAt: pubs[len(pubs)-1].PublishedAt,
			ID:        pubs[len(pubs)-1].Post.ID,
			Direction: types.PageDirectionOlder,
		}
	}

	var prevPageToken *types.PageToken
	if len(pubs) > 0 {
		prevPageToken = &types.PageToken{
			CreatedAt: pubs[0].PublishedAt,
			ID:        pubs[0].Post.ID,
			Direction: types.PageDirectionNewer,
		}
	}

	return pubs, types.PageTokenPair{
		Next: nextPageToken,
		Prev: prevPageToken,
	}, nil
}
