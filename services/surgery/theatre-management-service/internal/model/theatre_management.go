package model

import "time"

// TheatreManagement represents a theatre-management entity.
type TheatreManagement struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
