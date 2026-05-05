package model

import "time"

// Pricing represents a pricing entity.
type Pricing struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
