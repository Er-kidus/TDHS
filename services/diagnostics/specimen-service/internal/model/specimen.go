package model

import "time"

// Specimen represents a specimen entity.
type Specimen struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
