package env

import (
	"campsite.rocks/campsite/apiserver/db"
	"campsite.rocks/campsite/apiserver/pubsub"
)

type Env struct {
	DB     *db.DB
	PubSub *pubsub.PubSub
}
