package dbtopb

import (
	"campsite.rocks/campsite/apiserver/db"
	"campsite.rocks/campsite/apiserver/types"
	campsitev1 "campsite.rocks/campsite/gen/proto/campsite/v1"
)

func UserToProto(user *db.User) (*campsitev1.User, error) {
	return &campsitev1.User{
		Id:   types.EncodeID(user.ID),
		Name: user.Name,
	}, nil
}
