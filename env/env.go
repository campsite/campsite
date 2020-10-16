package env

import (
	"campsite.rocks/campsite/db"
	"github.com/nats-io/nats.go"
)

type Env struct {
	DB   *db.DB
	Nats *nats.Conn
}
