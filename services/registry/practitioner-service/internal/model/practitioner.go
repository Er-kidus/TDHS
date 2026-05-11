package model

import "time"

// Practitioner represents a practitioner entity.
type Practitioner struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
