package model

import "time"

// DischargePlanning represents a discharge-planning entity.
type DischargePlanning struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
