package dbtopb

import (
	"campsite.rocks/campsite/db"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/types"
)

func UserToProto(user *db.User) (*campsitev1.User, error) {
	return &campsitev1.User{
		Id:   types.EncodeID(user.ID),
		Name: user.Name,
	}, nil
}
