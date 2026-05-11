package model

import "time"

// Configuration represents a configuration entity.
type Configuration struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
