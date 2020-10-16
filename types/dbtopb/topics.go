package dbtopb

import (
	"campsite.rocks/campsite/db"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"github.com/golang/protobuf/ptypes"
)

func PublishToProto(publish *db.Publish) (*campsitev1.Publish, error) {
	ptypesPublishedAt, err := ptypes.TimestampProto(publish.PublishedAt)
	if err != nil {
		return nil, err
	}

	post, err := PostToProto(publish.Post)
	if err != nil {
		return nil, err
	}

	var publisher *campsitev1.User
	if publish.Publisher != nil {
		var err error
		publisher, err = UserToProto(*&publish.Publisher)
		if err != nil {
			return nil, err
		}
	}

	return &campsitev1.Publish{
		Post:        post,
		PublishedAt: ptypesPublishedAt,
		Publisher:   publisher,
	}, nil
}
