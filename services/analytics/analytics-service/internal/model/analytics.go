package model

import "time"

// Analytics represents a analytics entity.
type Analytics struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
