package model

import "time"

// Teleconsult represents a teleconsult entity.
type Teleconsult struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
