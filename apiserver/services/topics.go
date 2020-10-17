package services

import (
	"context"
	"time"

	"campsite.rocks/campsite/apiserver/db"
	"campsite.rocks/campsite/apiserver/env"
	"campsite.rocks/campsite/apiserver/security"
	"campsite.rocks/campsite/apiserver/types"
	"campsite.rocks/campsite/apiserver/types/dbtopb"
	campsitev1 "campsite.rocks/campsite/gen/proto/campsite/v1"
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

	if in.Wait && pageToken.Direction == types.PageDirectionNewer {
		if err := db.WaitForFeed(ctx, ts.DB, ts.PubSub, principal.UserID, pageToken); err != nil {
			return nil, err
		}
	}

	var pubs []*db.Publication
	var pageTokenPair types.PageTokenPair
	if err := ts.DB.Begin(ctx, pgx.TxOptions{
		AccessMode: pgx.ReadOnly,
	}, func(ctx context.Context, tx *db.Tx) error {
		var err error
		pubs, pageTokenPair, err = db.Feed(ctx, tx, principal.UserID, int(in.ParentDepth), pageToken, int(in.Limit))
		if err != nil {
			return err
		}
		return nil
	}); err != nil {
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

func NewTopicsServer(env *env.Env) campsitev1.TopicsServer {
	return &topicsServer{Env: env}
}
