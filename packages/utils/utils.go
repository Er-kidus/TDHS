package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

func NewID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		panic(fmt.Sprintf("utils.NewID: failed to generate random bytes: %v", err))
	}
	return hex.EncodeToString(b)
}

func StringPtr(s string) *string {
	return &s
}
