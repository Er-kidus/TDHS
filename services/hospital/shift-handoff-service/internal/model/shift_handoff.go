package model

import "time"

// ShiftHandoff represents a shift-handoff entity.
type ShiftHandoff struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
