package model

import "time"

// Emergency represents a emergency entity.
type Emergency struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
