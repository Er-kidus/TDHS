package model

import "time"

// Warehouse represents a warehouse entity.
type Warehouse struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
