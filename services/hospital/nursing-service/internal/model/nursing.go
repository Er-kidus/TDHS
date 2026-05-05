package model

import "time"

// Nursing represents a nursing entity.
type Nursing struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
