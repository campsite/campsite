package types

import (
	"encoding/base64"
	"time"

	tpb "campsite.rocks/campsite/apiserver/types/proto"
	campsitev1 "campsite.rocks/campsite/proto/campsite/v1"
	"github.com/google/uuid"
	"google.golang.org/protobuf/proto"
)

type PageTokenPair struct {
	Next *PageToken
	Prev *PageToken
}

type PageDirection int

const (
	PageDirectionOlder PageDirection = -1
	PageDirectionNewer PageDirection = 1
)

type PageToken struct {
	CreatedAt time.Time
	ID        uuid.UUID
	Direction PageDirection
}

func EncodePageToken(pt PageToken) (string, error) {
	var direction tpb.PageDirection
	switch pt.Direction {
	case PageDirectionNewer:
		direction = tpb.PageDirection_NEWER
	case PageDirectionOlder:
		direction = tpb.PageDirection_OLDER
	}

	ptProto := tpb.PageToken{
		CreatedAt: pt.CreatedAt.UnixNano(),
		Id:        pt.ID[:],
		Direction: direction,
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

	var direction PageDirection
	switch ptProto.Direction {
	case tpb.PageDirection_NEWER:
		direction = PageDirectionNewer
	case tpb.PageDirection_OLDER:
		direction = PageDirectionOlder
	}

	return PageToken{
		CreatedAt: time.Unix(0, ptProto.CreatedAt),
		ID:        id,
		Direction: direction,
	}, nil
}

func PageTokenPairToProto(ptp PageTokenPair) (*campsitev1.PageTokenPair, error) {
	var next string
	if ptp.Next != nil {
		var err error
		next, err = EncodePageToken(*ptp.Next)
		if err != nil {
			return nil, err
		}
	}

	var prev string
	if ptp.Prev != nil {
		var err error
		prev, err = EncodePageToken(*ptp.Prev)
		if err != nil {
			return nil, err
		}
	}

	return &campsitev1.PageTokenPair{
		Next: next,
		Prev: prev,
	}, nil
}
