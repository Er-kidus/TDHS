package model

import "time"

// Procurement represents a procurement entity.
type Procurement struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
