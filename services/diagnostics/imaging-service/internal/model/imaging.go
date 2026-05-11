package model

import "time"

// Imaging represents a imaging entity.
type Imaging struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
