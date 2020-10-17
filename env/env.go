package env

import (
	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/pubsub"
)

type Env struct {
	DB     *db.DB
	PubSub *pubsub.PubSub
}
