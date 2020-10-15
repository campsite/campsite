package types

import (
	"encoding/base64"
	"time"

	tpb "campsite.rocks/campsite/types/proto"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

type PageToken struct {
	CreatedAt time.Time
	ID        uuid.UUID
}

func EncodePageToken(pt PageToken) (string, error) {
	ptProto := tpb.PageToken{
		CreatedAt: pt.CreatedAt.UnixNano(),
		Id:        pt.ID[:],
	}

	b, err := proto.Marshal(&ptProto)
	if err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(b), nil
}

func DecodePageToken(raw string) (PageToken, error) {
	b, err := base64.RawURLEncoding.DecodeString(raw)
	if err != nil {
		return PageToken{}, err
	}

	var ptProto tpb.PageToken
	if err := proto.Unmarshal(b, &ptProto); err != nil {
		return PageToken{}, err
	}

	id, err := uuid.FromBytes(ptProto.Id)
	if err != nil {
		return PageToken{}, err
	}

	return PageToken{
		CreatedAt: time.Unix(0, ptProto.CreatedAt),
		ID:        id,
	}, nil
}
