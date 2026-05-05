package model

import "time"

// Scheduling represents a scheduling entity.
type Scheduling struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
