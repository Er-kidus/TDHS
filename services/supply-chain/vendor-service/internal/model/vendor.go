package model

import "time"

// Vendor represents a vendor entity.
type Vendor struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
