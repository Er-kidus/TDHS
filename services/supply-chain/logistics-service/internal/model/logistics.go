package model

import "time"

// Logistics represents a logistics entity.
type Logistics struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
