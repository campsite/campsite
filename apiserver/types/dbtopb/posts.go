package dbtopb

import (
	"bytes"
	"encoding/base64"
	"encoding/binary"
	"time"

	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/types"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/wrappers"
	"github.com/google/uuid"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func DecodePostChildrenNextPageToken(s string) (db.PostChildrenNextPageToken, error) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return db.PostChildrenNextPageToken{}, err
	}

	r := bytes.NewBuffer(b)

	var lastActiveAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &lastActiveAtNanos); err != nil {
		return db.PostChildrenNextPageToken{}, err
	}

	var createdAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &createdAtNanos); err != nil {
		return db.PostChildrenNextPageToken{}, err
	}

	var id uuid.UUID
	if err := binary.Read(r, binary.LittleEndian, &id); err != nil {
		return db.PostChildrenNextPageToken{}, err
	}

	return db.PostChildrenNextPageToken{
		LastActiveAt: time.Unix(0, lastActiveAtNanos),
		CreatedAt:    time.Unix(0, createdAtNanos),
		ID:           id,
	}, nil
}

func EncodePostChildrenNextPageToken(token db.PostChildrenNextPageToken) (string, error) {
	var buf bytes.Buffer
	if err := binary.Write(&buf, binary.LittleEndian, token.LastActiveAt.UnixNano()); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, token.CreatedAt.UnixNano()); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, token.ID); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf.Bytes()), nil
}

func DecodeDescendantsWaitToken(s string) (db.DescendantsWaitToken, error) {
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return db.DescendantsWaitToken{}, err
	}

	r := bytes.NewBuffer(b)

	var lastActiveAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &lastActiveAtNanos); err != nil {
		return db.DescendantsWaitToken{}, err
	}

	var createdAtNanos int64
	if err := binary.Read(r, binary.LittleEndian, &createdAtNanos); err != nil {
		return db.DescendantsWaitToken{}, err
	}

	var id uuid.UUID
	if err := binary.Read(r, binary.LittleEndian, &id); err != nil {
		return db.DescendantsWaitToken{}, err
	}

	return db.DescendantsWaitToken{
		CreatedAt: time.Unix(0, createdAtNanos),
		ID:        id,
	}, nil
}

func EncodeDescendantsWaitToken(token db.DescendantsWaitToken) (string, error) {
	var buf bytes.Buffer
	if err := binary.Write(&buf, binary.LittleEndian, token.CreatedAt.UnixNano()); err != nil {
		return "", err
	}
	if err := binary.Write(&buf, binary.LittleEndian, token.ID); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf.Bytes()), nil
}

func PostToProto(post *db.Post) (*campsitev1.Post, error) {
	ptypesCreatedAt, err := ptypes.TimestampProto(post.CreatedAt)
	if err != nil {
		return nil, err
	}

	var ptypesEditedAt *timestamppb.Timestamp
	if post.EditedAt != nil {
		var err error
		ptypesEditedAt, err = ptypes.TimestampProto(*post.EditedAt)
		if err != nil {
			return nil, err
		}
	}

	var ptypesDeletedAt *timestamppb.Timestamp
	if post.DeletedAt != nil {
		var err error
		ptypesDeletedAt, err = ptypes.TimestampProto(*post.DeletedAt)
		if err != nil {
			return nil, err
		}
	}

	var author *campsitev1.User
	if post.Author != nil {
		var err error
		author, err = UserToProto(post.Author)
		if err != nil {
			return nil, err
		}
	}

	var ptypesContent *wrappers.StringValue
	if post.Content != nil {
		ptypesContent = &wrappers.StringValue{Value: *post.Content}
	}

	var ptypesWarning *wrappers.StringValue
	if post.Warning != nil {
		ptypesWarning = &wrappers.StringValue{Value: *post.Warning}
	}

	var ptypesParentPostID *wrappers.StringValue
	if post.ParentPostID != nil {
		ptypesParentPostID = &wrappers.StringValue{Value: types.EncodeID(*post.ParentPostID)}
	}

	var parentPost *campsitev1.Post
	if post.ParentPost != nil {
		var err error
		parentPost, err = PostToProto(post.ParentPost)
		if err != nil {
			return nil, err
		}
	}

	parentNextPageToken, err := EncodePostChildrenNextPageToken(post.ParentNextPageToken)
	if err != nil {
		return nil, err
	}

	return &campsitev1.Post{
		Id:                  types.EncodeID(post.ID),
		CreatedAt:           ptypesCreatedAt,
		EditedAt:            ptypesEditedAt,
		DeletedAt:           ptypesDeletedAt,
		Author:              author,
		Content:             ptypesContent,
		Warning:             ptypesWarning,
		ParentPostId:        ptypesParentPostID,
		ParentPost:          parentPost,
		ParentNextPageToken: parentNextPageToken,
		NumChildren:         int32(post.NumChildren),
	}, nil
}
