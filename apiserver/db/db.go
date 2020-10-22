package db

import (
	"context"
	"time"

	"github.com/jackc/pgconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"go.opencensus.io/trace"
	"google.golang.org/grpc/status"
)

const waitTimeout = 10 * time.Second

type DB struct {
	pool *pgxpool.Pool
}

type OnCommit func(ctx context.Context)

type Tx struct {
	tx        pgx.Tx
	onCommits []OnCommit
	rootTx    *Tx
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
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
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
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
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
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
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
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		return nil, err
	}

	return tag, nil
}

func (t *Tx) commit(ctx context.Context) error {
	if err := t.tx.Commit(ctx); err != nil {
		return err
	}

	for _, oc := range t.onCommits {
		oc(ctx)
	}

	return nil
}

func (t *Tx) OnCommit(f OnCommit) {
	if t.rootTx != nil {
		t.rootTx.OnCommit(f)
		return
	}
	t.onCommits = append(t.onCommits, f)
}

func (t *Tx) Begin(ctx context.Context, f func(ctx context.Context, tx *Tx) error) error {
	ctx, span := trace.StartSpan(ctx, "db.Transaction")
	defer span.End()

	tx, err := t.tx.Begin(ctx)
	if err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		return err
	}

	rootTx := t
	if t.rootTx != nil {
		rootTx = t.rootTx
	}
	subTx := &Tx{tx: tx, rootTx: rootTx}
	if err := f(ctx, subTx); err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		tx.Rollback(ctx)
		return err
	}

	if err := subTx.commit(ctx); err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
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
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		return err
	}

	t := &Tx{tx: tx}
	if err := f(ctx, t); err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		tx.Rollback(ctx)
		return err
	}

	if err := t.commit(ctx); err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		return err
	}

	return nil
}

func Wrap(pool *pgxpool.Pool) *DB {
	return &DB{pool: pool}
}

type PageDirection int

var (
	PageDirectionOlder PageDirection = -1
	PageDirectionNewer PageDirection = 1
)
