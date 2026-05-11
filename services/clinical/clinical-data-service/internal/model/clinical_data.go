package model

import "time"

// ClinicalData represents a clinical-data entity.
type ClinicalData struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
