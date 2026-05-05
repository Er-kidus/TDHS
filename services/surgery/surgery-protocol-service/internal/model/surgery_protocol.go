package model

import "time"

// SurgeryProtocol represents a surgery-protocol entity.
type SurgeryProtocol struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
