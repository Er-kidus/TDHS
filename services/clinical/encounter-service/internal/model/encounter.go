package model

import "time"

// Encounter represents a encounter entity.
type Encounter struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
