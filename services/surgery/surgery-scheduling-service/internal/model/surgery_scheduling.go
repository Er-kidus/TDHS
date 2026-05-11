package model

import "time"

// SurgeryScheduling represents a surgery-scheduling entity.
type SurgeryScheduling struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
