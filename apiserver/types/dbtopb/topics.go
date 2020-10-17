package dbtopb

import (
	"campsite.rocks/campsite/apiserver/db"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"github.com/golang/protobuf/ptypes"
)

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
