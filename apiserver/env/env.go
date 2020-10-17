package env

import (
	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/pubsub"
)

type Env struct {
	DB     *db.DB
	PubSub *pubsub.PubSub
}
