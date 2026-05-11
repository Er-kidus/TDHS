package model

import "time"

// Telemedicine represents a telemedicine entity.
type Telemedicine struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
