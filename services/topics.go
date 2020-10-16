package services

import (
	"context"
	"time"

	"campsite.rocks/campsite/db"
	"campsite.rocks/campsite/env"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"campsite.rocks/campsite/security"
	"campsite.rocks/campsite/types"
	"campsite.rocks/campsite/types/dbtopb"
	"github.com/jackc/pgx/v4"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type topicsServer struct {
	campsitev1.UnimplementedTopicsServer
	*env.Env
}

func (ts *topicsServer) GetFeed(ctx context.Context, in *campsitev1.GetFeedRequest) (*campsitev1.GetFeedResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	tx, err := ts.DB.BeginTx(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	})
	if err != nil {
		return nil, err
	}
	defer tx.Rollback(ctx)

	pageToken := types.PageToken{
		CreatedAt: time.Now(),
		Direction: types.PageDirectionOlder,
	}
	if in.PageToken != "" {
		var err error
		pageToken, err = types.DecodePageToken(in.PageToken)
		if err != nil {
			return nil, status.Error(codes.InvalidArgument, "page_token")
		}
	}

	pubs, pageTokenPair, err := db.Feed(ctx, tx, principal.UserID, int(in.ParentDepth), pageToken, int(in.Limit))
	if err != nil {
		return nil, err
	}

	pubPbs := make([]*campsitev1.Publication, len(pubs))
	for i, pub := range pubs {
		var err error
		pubPbs[i], err = dbtopb.PublicationToProto(pub)
		if err != nil {
			return nil, err
		}
	}

	resp := &campsitev1.GetFeedResponse{
		Publications: pubPbs,
	}

	protoPageTokenPair, err := types.PageTokenPairToProto(pageTokenPair)
	if err != nil {
		return nil, err
	}
	resp.PageTokens = protoPageTokenPair

	return resp, nil
}

func (ts *topicsServer) WaitForFeed(ctx context.Context, in *campsitev1.WaitForFeedRequest) (*campsitev1.WaitForFeedResponse, error) {
	principal := security.PrincipalFromContext(ctx)
	if principal == nil {
		return nil, status.Error(codes.Unauthenticated, "")
	}

	pageToken, err := types.DecodePageToken(in.PageToken)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "page_token")
	}

	// Only allow newer pagination.
	if pageToken.Direction != types.PageDirectionNewer {
		return nil, status.Error(codes.InvalidArgument, "page_token")
	}

	sub, err := ts.Nats.SubscribeSync("feed:" + types.EncodeID(principal.UserID))
	if err != nil {
		return nil, err
	}
	defer sub.Unsubscribe()

	msg, err := sub.NextMsgWithContext(ctx)
	if err != nil {
		return nil, err
	}

	_ = msg

	return &campsitev1.WaitForFeedResponse{}, nil
}

func NewTopicsServer(env *env.Env) campsitev1.TopicsServer {
	return &topicsServer{Env: env}
}
