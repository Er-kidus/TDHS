package model

import "time"

// IntegrationJob represents a integration-job entity.
type IntegrationJob struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
