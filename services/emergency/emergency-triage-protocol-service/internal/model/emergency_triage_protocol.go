package model

import "time"

// EmergencyTriageProtocol represents a emergency-triage-protocol entity.
type EmergencyTriageProtocol struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
