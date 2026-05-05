package model

import "time"

// Dispensing represents a dispensing entity.
type Dispensing struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
