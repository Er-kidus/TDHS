package model

import "time"

// Reporting represents a reporting entity.
type Reporting struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
