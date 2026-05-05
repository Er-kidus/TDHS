package model

import "time"

// InsuranceEligibility represents a insurance-eligibility entity.
type InsuranceEligibility struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
