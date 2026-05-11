package model

import "time"

// Surveillance represents a surveillance entity.
type Surveillance struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
