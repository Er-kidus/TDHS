package model

import "time"

// Messaging represents a messaging entity.
type Messaging struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
