package model

import "time"

// Identifier represents a identifier entity.
type Identifier struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
