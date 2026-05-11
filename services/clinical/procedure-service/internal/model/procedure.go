package model

import "time"

// Procedure represents a procedure entity.
type Procedure struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
