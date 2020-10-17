package pubsub

import (
	"context"

	"github.com/go-redis/redis/v8"
	"go.opencensus.io/trace"
)

type PubSub struct {
	rdb *redis.Client
}

func (ps *PubSub) Publish(ctx context.Context, key string, value string) error {
	ctx, span := trace.StartSpan(ctx, "pubsub.Publish")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", key))

	_, err := ps.rdb.Publish(ctx, key, value).Result()
	if err != nil {
		return err
	}
	return nil
}

func (ps *PubSub) Subscribe(ctx context.Context, key string) (*Subscription, error) {
	ctx, span := trace.StartSpan(ctx, "pubsub.Subscribe")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", key))

	rpubsub := ps.rdb.Subscribe(ctx, key)
	// Wait for confirmation that subscription is created.
	_, err := rpubsub.Receive(ctx)
	if err != nil {
		return nil, err
	}

	return &Subscription{
		key:     key,
		rpubsub: rpubsub,
	}, nil
}

type Subscription struct {
	key     string
	rpubsub *redis.PubSub
}

func (s *Subscription) Receive(ctx context.Context) (string, error) {
	ctx, span := trace.StartSpan(ctx, "pubsub.Receive")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", s.key))
	msg, err := s.rpubsub.ReceiveMessage(ctx)
	if err != nil {
		return "", err
	}

	return msg.Payload, nil
}

func (s *Subscription) Unsubscribe(ctx context.Context) error {
	return s.rpubsub.Close()
}

func Wrap(rdb *redis.Client) *PubSub {
	return &PubSub{rdb: rdb}
}
