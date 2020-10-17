package dbtopb

import (
	"campsite.social/campsite/apiserver/db"
	"campsite.social/campsite/apiserver/types"
	campsitev1 "campsite.social/campsite/gen/proto/campsite/v1"
	"github.com/golang/protobuf/ptypes"
	"github.com/golang/protobuf/ptypes/wrappers"
	"google.golang.org/protobuf/types/known/timestamppb"
)

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

	children := make([]*campsitev1.Post, len(post.Children))
	for i, child := range post.Children {
		var err error
		children[i], err = PostToProto(child)
		if err != nil {
			return nil, err
		}
	}

	protoPageTokenPair, err := types.PageTokenPairToProto(post.ChildrenPageTokenPair)
	if err != nil {
		return nil, err
	}

	return &campsitev1.Post{
		Id:                 types.EncodeID(post.ID),
		CreatedAt:          ptypesCreatedAt,
		EditedAt:           ptypesEditedAt,
		DeletedAt:          ptypesDeletedAt,
		Author:             author,
		Content:            ptypesContent,
		Warning:            ptypesWarning,
		ParentPostId:       ptypesParentPostID,
		ParentPost:         parentPost,
		Children:           children,
		ChildrenPageTokens: protoPageTokenPair,
		NumChildren:        int32(post.NumChildren),
	}, nil
}
