package model

import "time"

// Inventory represents a inventory entity.
type Inventory struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
