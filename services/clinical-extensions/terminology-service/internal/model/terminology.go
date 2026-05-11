package model

import "time"

// Terminology represents a terminology entity.
type Terminology struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
