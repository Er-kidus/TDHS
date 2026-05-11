package model

import "time"

// NursingDashboard represents a nursing-dashboard entity.
type NursingDashboard struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
