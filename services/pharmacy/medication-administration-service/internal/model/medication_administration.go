package model

import "time"

// MedicationAdministration represents a medication-administration entity.
type MedicationAdministration struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
