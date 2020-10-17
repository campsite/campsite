package types

import (
	"encoding/base32"

	"github.com/google/uuid"
)

var base32Encoding = base32.NewEncoding("abcdefghijklmnopqrstuvwxyz234567").WithPadding(base32.NoPadding)

func EncodeID(n uuid.UUID) string {
	bytes, _ := n.MarshalBinary()
	return base32Encoding.EncodeToString(bytes)
}

func DecodeID(id string) (uuid.UUID, error) {
	bytes, err := base32Encoding.DecodeString(id)
	if err != nil {
		return uuid.Nil, err
	}
	return uuid.FromBytes(bytes)
}
