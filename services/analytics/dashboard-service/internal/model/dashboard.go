package model

import "time"

// Dashboard represents a dashboard entity.
type Dashboard struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
