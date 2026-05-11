package model

import "time"

// PatientMovement represents a patient-movement entity.
type PatientMovement struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
