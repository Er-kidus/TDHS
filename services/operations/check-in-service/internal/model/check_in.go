package model

import "time"

// CheckIn represents a check-in entity.
type CheckIn struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
