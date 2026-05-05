package model

import "time"

// Inpatient represents a inpatient entity.
type Inpatient struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
