package model

import "time"

// Surgery represents a surgery entity.
type Surgery struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
