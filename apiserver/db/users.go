package db

import (
	"context"
	"errors"
	"time"

	"campsite.social/campsite/apiserver/pubsub"
	"campsite.social/campsite/apiserver/types"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/rs/zerolog/log"
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

type Publication struct {
	PublishedAt time.Time
	Publisher   *User
	Post        *Post
}

func publishUserChannel(ctx context.Context, tx *Tx, pbsb *pubsub.PubSub, postID uuid.UUID, userChannelID uuid.UUID, publisherUserID uuid.UUID) error {
	if _, err := tx.Query(ctx, `
		insert into publications (
			post_id,
			channel_id,
			publisher_user_id
		)
		select
			$1,
			$2,
			$3
	`, postID, userChannelID, publisherUserID).Exec(); err != nil {
		return err
	}

	userIDs := []uuid.UUID{userChannelID}
	// Non-private posts need to be fanned out to all subscriptions.
	if err := tx.Query(ctx, `
		select user_id
		from subscriptions
		where channel_id = $1
	`, userChannelID).Rows(func(rows pgx.Rows) error {
		var userID uuid.UUID
		if err := rows.Scan(&userID); err != nil {
			return err
		}
		userIDs = append(userIDs, userID)
		return nil
	}); err != nil {
		return err
	}

	// TODO: Consider running this outside a transaction/aggregating publishes.
	tx.OnCommit(func(ctx context.Context) {
		for _, userID := range userIDs {
			if err := pbsb.Publish(ctx, "user:"+types.EncodeID(userID), []byte{}); err != nil {
				log.Err(err).Msg("publishUserChannel: failed to publish")
			}
		}
	})

	return nil
}

type FeedPageTokenPair struct {
	Next *FeedPageToken
	Prev *FeedPageToken
}

type FeedPageToken struct {
	PublishedAt time.Time
	ID          uuid.UUID
	Direction   PageDirection
}

func WaitForFeed(ctx context.Context, db *DB, pbsb *pubsub.PubSub, userID uuid.UUID, pageToken FeedPageToken) error {
	if pageToken.Direction != PageDirectionNewer {
		return nil
	}

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
							channel_id = any(
								select
									subscriptions.channel_id
								from
									subscriptions
								where
									subscriptions.user_id = $1
							)
						) or (
							channel_id = $1
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
		`, userID, pageToken.PublishedAt, pageToken.ID, pageToken.Direction).Row(&hasNewer); err != nil {
			return err
		}

		if hasNewer {
			break
		}

		if err := func() error {
			// Wake up every 10 seconds to check for new posts, in case we missed them.
			ctx, cancel := context.WithTimeout(ctx, waitTimeout)
			defer cancel()

			msg, err := sub.Receive(ctx)
			if err != nil {
				if errors.Is(err, context.DeadlineExceeded) {
					return nil
				}
				return err
			}

			_ = msg
			return nil
		}(); err != nil {
			return err
		}
	}

	return nil
}

func Feed(ctx context.Context, tx *Tx, userID uuid.UUID, parentDepth int, pageToken FeedPageToken, limit int) ([]*Publication, FeedPageTokenPair, error) {
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
					channel_id = any(
						select
							subscriptions.channel_id
						from
							subscriptions
						where
							subscriptions.user_id = $1
					)
				) or (
					channel_id = $1
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
	`, userID, pageToken.PublishedAt, pageToken.ID, pageToken.Direction, limit).Rows(func(rows pgx.Rows) error {
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
		return nil, FeedPageTokenPair{}, err
	}

	posts, err := PostsByID(ctx, tx, postIDs, parentDepth)
	if err != nil {
		return nil, FeedPageTokenPair{}, err
	}

	for _, postID := range postIDs {
		*postsByID[postID] = *posts[postID]
	}

	publishers, err := UsersByID(ctx, tx, publisherIDs)
	if err != nil {
		return nil, FeedPageTokenPair{}, err
	}

	for _, pub := range pubs {
		*pub.Publisher = *publishers[pub.Publisher.ID]
	}

	var ptp FeedPageTokenPair
	if len(pubs) > 0 {
		if len(pubs) >= limit || pageToken.Direction == PageDirectionNewer {
			ptp.Next = &FeedPageToken{
				PublishedAt: pubs[len(pubs)-1].PublishedAt,
				ID:          pubs[len(pubs)-1].Post.ID,
				Direction:   PageDirectionOlder,
			}
		}

		ptp.Prev = &FeedPageToken{
			PublishedAt: pubs[0].PublishedAt,
			ID:          pubs[0].Post.ID,
			Direction:   PageDirectionNewer,
		}
	} else {
		ptp.Prev = &FeedPageToken{
			PublishedAt: pageToken.PublishedAt,
			ID:          pageToken.ID,
			Direction:   PageDirectionNewer,
		}
	}

	return pubs, ptp, nil
}

func wakeUserNotifications(ctx context.Context, pbsb *pubsub.PubSub, userID uuid.UUID) error {
	if err := pbsb.Publish(ctx, "notifications:"+types.EncodeID(userID), []byte{}); err != nil {
		return err
	}
	return nil
}

func CreateReplyNotification(ctx context.Context, tx *Tx, pbsb *pubsub.PubSub, targetUserID uuid.UUID, replyPostID uuid.UUID) (uuid.UUID, error) {
	var id uuid.UUID
	if err := tx.Query(ctx, `
		insert into notifications (
			type,
			user_id,
			reply_post_id
		)
		values (
			'reply',
			$1,
			$2
		)
		returning id
	`,
		targetUserID, replyPostID,
	).Row(&id); err != nil {
		return uuid.Nil, err
	}

	tx.OnCommit(func(ctx context.Context) {
		if err := wakeUserNotifications(ctx, pbsb, targetUserID); err != nil {
			log.Err(err).Msg("wakeUserNotifications: failed to wake")
		}
	})

	return id, nil
}

type NotificationBody interface {
	notificationBody()
}

type Notification struct {
	ID        uuid.UUID
	CreatedAt time.Time
	Body      NotificationBody
}

type ReplyNotificationBody struct {
	Post Post
}

func (ReplyNotificationBody) notificationBody() {}

type NotificationsPageTokenPair struct {
	Next *NotificationsPageToken
	Prev *NotificationsPageToken
}

type NotificationsPageToken struct {
	CreatedAt time.Time
	ID        uuid.UUID
	Direction PageDirection
}

func WaitForNotifications(ctx context.Context, db *DB, pbsb *pubsub.PubSub, userID uuid.UUID, pageToken NotificationsPageToken) error {
	if pageToken.Direction != PageDirectionNewer {
		return nil
	}

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
				from
					notifications
				where
					user_id = $1 and (
						case
							when $4 = -1 then (
								(created_at < $2) or
								(created_at = $2 and id > $3)
							)
							when $4 = 1 then (
								(created_at > $2) or
								(created_at = $2 and id < $3)
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

		if err := func() error {
			// Wake up every 10 seconds to check for new posts, in case we missed them.
			ctx, cancel := context.WithTimeout(ctx, waitTimeout)
			defer cancel()

			msg, err := sub.Receive(ctx)
			if err != nil {
				if errors.Is(err, context.DeadlineExceeded) {
					return nil
				}
				return err
			}

			_ = msg
			return nil
		}(); err != nil {
			return err
		}
	}

	return nil
}

func Notifications(ctx context.Context, tx *Tx, userID uuid.UUID, pageToken NotificationsPageToken, limit int) ([]*Notification, NotificationsPageTokenPair, error) {
	var notifs []*Notification

	if err := tx.Query(ctx, `
		select
			id, created_at
		from
			notifications
		where
			user_id = $1 and (
				case
					when $4 = -1 then (
						(created_at < $2) or
						(created_at = $2 and id > $3)
					)
					when $4 = 1 then (
						(created_at > $2) or
						(created_at = $2 and id < $3)
					)
					else false
				end
			)
		order by
			created_at desc, id
		limit $5
	`, userID, pageToken.CreatedAt, pageToken.ID, pageToken.Direction, limit).Rows(func(rows pgx.Rows) error {
		notif := &Notification{}
		if err := rows.Scan(&notif.ID, &notif.CreatedAt); err != nil {
			return err
		}

		notifs = append(notifs, notif)
		return nil
	}); err != nil {
		return nil, NotificationsPageTokenPair{}, err
	}

	var ptp NotificationsPageTokenPair
	if len(notifs) > 0 {
		if len(notifs) >= limit || pageToken.Direction == PageDirectionNewer {
			ptp.Next = &NotificationsPageToken{
				CreatedAt: notifs[len(notifs)-1].CreatedAt,
				ID:        notifs[len(notifs)-1].ID,
				Direction: PageDirectionOlder,
			}
		}

		ptp.Prev = &NotificationsPageToken{
			CreatedAt: notifs[0].CreatedAt,
			ID:        notifs[0].ID,
			Direction: PageDirectionNewer,
		}
	} else {
		ptp.Prev = &NotificationsPageToken{
			CreatedAt: pageToken.CreatedAt,
			ID:        pageToken.ID,
			Direction: PageDirectionNewer,
		}
	}

	return notifs, ptp, nil
}
