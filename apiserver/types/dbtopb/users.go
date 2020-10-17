package dbtopb

import (
	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/types"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
)

func UserToProto(user *db.User) (*campsitev1.User, error) {
	return &campsitev1.User{
		Id:   types.EncodeID(user.ID),
		Name: user.Name,
	}, nil
}
