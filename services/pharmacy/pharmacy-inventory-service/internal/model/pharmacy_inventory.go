package model

import "time"

// PharmacyInventory represents a pharmacy-inventory entity.
type PharmacyInventory struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
