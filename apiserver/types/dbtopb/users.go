package dbtopb

import (
	"bytes"
	"encoding/base64"
	"encoding/binary"
	"time"

	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/types"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
	"github.com/golang/protobuf/ptypes"
	"github.com/google/uuid"
)

func UserToProto(user *db.User) (*campsitev1.User, error) {
	return &campsitev1.User{
		Id:   types.EncodeID(user.ID),
		Name: user.Name,
	}, nil
}

func DecodeFeedPageToken(s string) (db.FeedPageToken, error) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return db.FeedPageToken{}, err
	}

	r := bytes.NewBuffer(b)

	var publishedAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &publishedAtNanos); err != nil {
		return db.FeedPageToken{}, err
	}

	var id uuid.UUID
	if err := binary.Read(r, binary.LittleEndian, &id); err != nil {
		return db.FeedPageToken{}, err
	}

	var dirByte byte
	if err := binary.Read(r, binary.LittleEndian, &dirByte); err != nil {
		return db.FeedPageToken{}, err
	}

	return db.FeedPageToken{
		PublishedAt: time.Unix(0, publishedAtNanos),
		ID:          id,
		Direction:   byteToDirection(dirByte),
	}, nil
}

func EncodeFeedPageToken(token db.FeedPageToken) (string, error) {
	var buf bytes.Buffer
	if err := binary.Write(&buf, binary.LittleEndian, token.PublishedAt.UnixNano()); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, token.ID); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, directionToByte(token.Direction)); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf.Bytes()), nil
}

func EncodeFeedPageTokenPair(pair db.FeedPageTokenPair) (*campsitev1.PageTokenPair, error) {
	ptp := &campsitev1.PageTokenPair{}
	if pair.Next != nil {
		var err error
		ptp.Next, err = EncodeFeedPageToken(*pair.Next)
		if err != nil {
			return nil, err
		}
	}
	if pair.Prev != nil {
		var err error
		ptp.Prev, err = EncodeFeedPageToken(*pair.Prev)
		if err != nil {
			return nil, err
		}
	}
	return ptp, nil
}

func PublicationToProto(pub *db.Publication) (*campsitev1.Publication, error) {
	ptypesPublishedAt, err := ptypes.TimestampProto(pub.PublishedAt)
	if err != nil {
		return nil, err
	}

	post, err := PostToProto(pub.Post)
	if err != nil {
		return nil, err
	}

	var publisher *campsitev1.User
	if pub.Publisher != nil {
		var err error
		publisher, err = UserToProto(*&pub.Publisher)
		if err != nil {
			return nil, err
		}
	}

	return &campsitev1.Publication{
		Post:        post,
		PublishedAt: ptypesPublishedAt,
		Publisher:   publisher,
	}, nil
}

func DecodeNotificationsPageToken(s string) (db.NotificationsPageToken, error) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return db.NotificationsPageToken{}, err
	}

	r := bytes.NewBuffer(b)

	var publishedAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &publishedAtNanos); err != nil {
		return db.NotificationsPageToken{}, err
	}

	var id uuid.UUID
	if err := binary.Read(r, binary.LittleEndian, &id); err != nil {
		return db.NotificationsPageToken{}, err
	}

	var dirByte byte
	if err := binary.Read(r, binary.LittleEndian, &dirByte); err != nil {
		return db.NotificationsPageToken{}, err
	}

	return db.NotificationsPageToken{
		CreatedAt: time.Unix(0, publishedAtNanos),
		ID:        id,
		Direction: byteToDirection(dirByte),
	}, nil
}

func EncodeNotificationsPageToken(token db.NotificationsPageToken) (string, error) {
	var buf bytes.Buffer
	if err := binary.Write(&buf, binary.LittleEndian, token.CreatedAt.UnixNano()); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, token.ID); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, directionToByte(token.Direction)); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf.Bytes()), nil
}

func EncodeNotificationsPageTokenPair(pair db.NotificationsPageTokenPair) (*campsitev1.PageTokenPair, error) {
	ptp := &campsitev1.PageTokenPair{}
	if pair.Next != nil {
		var err error
		ptp.Next, err = EncodeNotificationsPageToken(*pair.Next)
		if err != nil {
			return nil, err
		}
	}
	if pair.Prev != nil {
		var err error
		ptp.Prev, err = EncodeNotificationsPageToken(*pair.Prev)
		if err != nil {
			return nil, err
		}
	}
	return ptp, nil
}

func NotificationToProto(notif *db.Notification) (*campsitev1.Notification, error) {
	ptypesCreatedAt, err := ptypes.TimestampProto(notif.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &campsitev1.Notification{
		Id:        types.EncodeID(notif.ID),
		CreatedAt: ptypesCreatedAt,
	}, nil
}
