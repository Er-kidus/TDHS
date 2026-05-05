package model

import "time"

// Careplan represents a careplan entity.
type Careplan struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
