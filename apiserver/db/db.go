package db

import (
	"context"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"go.opencensus.io/trace"
	"google.golang.org/grpc/codes"
)

type DB struct {
	pool *pgxpool.Pool
}

type Tx struct {
	tx pgx.Tx
}

type dbtx interface {
	QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row
	Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)
	Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error)
}

type Query struct {
	ctx  context.Context
	dbtx dbtx
	sql  string
	args []interface{}
}

func (q *Query) Row(dest ...interface{}) error {
	ctx, span := trace.StartSpan(q.ctx, "db.Query")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("sql", q.sql))

	if err := q.dbtx.QueryRow(ctx, q.sql, q.args...).Scan(dest...); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	return nil
}

func (q *Query) Rows(f func(rows pgx.Rows) error) error {
	ctx, span := trace.StartSpan(q.ctx, "db.Query")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("sql", q.sql))

	rows, err := q.dbtx.Query(ctx, q.sql, q.args...)
	if err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}
	defer rows.Close()

	for rows.Next() {
		if err := f(rows); err != nil {
			return err
		}
	}

	if err := rows.Err(); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	return nil
}

func (q *Query) Exec() (pgconn.CommandTag, error) {
	ctx, span := trace.StartSpan(q.ctx, "db.Exec")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("sql", q.sql))
	tag, err := q.dbtx.Exec(ctx, q.sql, q.args...)
	if err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return nil, err
	}

	return tag, nil
}

func (t *Tx) Begin(ctx context.Context, f func(ctx context.Context, tx *Tx) error) error {
	ctx, span := trace.StartSpan(ctx, "db.Transaction")
	defer span.End()

	tx, err := t.tx.Begin(ctx)
	if err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	if err := f(ctx, &Tx{tx: tx}); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		tx.Rollback(ctx)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	return nil
}

func (t *Tx) Query(ctx context.Context, sql string, args ...interface{}) *Query {
	return &Query{
		ctx:  ctx,
		dbtx: t.tx,
		sql:  sql,
		args: args,
	}
}

func (d *DB) Query(ctx context.Context, sql string, args ...interface{}) *Query {
	return &Query{
		ctx:  ctx,
		dbtx: d.pool,
		sql:  sql,
		args: args,
	}
}

func (d *DB) Begin(ctx context.Context, txOptions pgx.TxOptions, f func(ctx context.Context, tx *Tx) error) error {
	ctx, span := trace.StartSpan(ctx, "db.Transaction")
	defer span.End()

	tx, err := d.pool.BeginTx(ctx, txOptions)
	if err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	if err := f(ctx, &Tx{tx: tx}); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		tx.Rollback(ctx)
		return err
	}

	if err := tx.Commit(ctx); err != nil {
		span.SetStatus(trace.Status{
			Code:    int32(codes.Unknown),
			Message: err.Error(),
		})
		return err
	}

	return nil
}

func Wrap(pool *pgxpool.Pool) *DB {
	return &DB{pool: pool}
}
