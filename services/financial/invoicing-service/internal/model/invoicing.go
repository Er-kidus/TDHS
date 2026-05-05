package model

import "time"

// Invoicing represents a invoicing entity.
type Invoicing struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
