package model

import "time"

// Appointment represents a appointment entity.
type Appointment struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
