package model

import "time"

// ClinicalGuideline represents a clinical-guideline entity.
type ClinicalGuideline struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
