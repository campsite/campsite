package env

import (
	"github.com/jackc/pgx/v4/pgxpool"
)

type Env struct {
	DB *pgxpool.Pool
}
