package pubsub

import (
	"context"

	"github.com/nats-io/nats.go"
	"go.opencensus.io/trace"
	"google.golang.org/grpc/status"
)

type PubSub struct {
	nc *nats.Conn
}

func (ps *PubSub) Publish(ctx context.Context, key string, value []byte) error {
	ctx, span := trace.StartSpan(ctx, "pubsub.Publish")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", key))

	if err := ps.nc.Publish(key, value); err != nil {
		return err
	}
	return nil
}

func (ps *PubSub) Subscribe(ctx context.Context, key string) (*Subscription, error) {
	ctx, span := trace.StartSpan(ctx, "pubsub.Subscribe")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", key))

	sub, err := ps.nc.SubscribeSync(key)
	if err != nil {
		return nil, err
	}

	return &Subscription{
		key: key,
		sub: sub,
	}, nil
}

type Subscription struct {
	key string
	sub *nats.Subscription
}

func (s *Subscription) Receive(ctx context.Context) ([]byte, error) {
	ctx, span := trace.StartSpan(ctx, "pubsub.Receive")
	defer span.End()

	span.AddAttributes(trace.StringAttribute("key", s.key))
	msg, err := s.sub.NextMsgWithContext(ctx)
	if err != nil {
		s := status.FromContextError(err)
		span.SetStatus(trace.Status{
			Code:    s.Proto().Code,
			Message: s.Message(),
		})
		return nil, err
	}

	return msg.Data, nil
}

func (s *Subscription) Unsubscribe(ctx context.Context) error {
	return s.sub.Unsubscribe()
}

func Wrap(nc *nats.Conn) *PubSub {
	return &PubSub{nc: nc}
}
