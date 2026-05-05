package model

import "time"

// Ambulance represents a ambulance entity.
type Ambulance struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
