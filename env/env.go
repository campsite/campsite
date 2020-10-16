package env

import (
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/nats-io/nats.go"
)

type Env struct {
	DB   *pgxpool.Pool
	Nats *nats.Conn
}
