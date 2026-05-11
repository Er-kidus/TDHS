package model

import "time"

// LabWorkflow represents a lab-workflow entity.
type LabWorkflow struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
