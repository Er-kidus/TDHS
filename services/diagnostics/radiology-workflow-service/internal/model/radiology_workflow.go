package model

import "time"

// RadiologyWorkflow represents a radiology-workflow entity.
type RadiologyWorkflow struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
