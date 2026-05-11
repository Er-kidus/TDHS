package model

import "time"

// Prescription represents a prescription entity.
type Prescription struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
