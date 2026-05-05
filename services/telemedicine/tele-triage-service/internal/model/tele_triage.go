package model

import "time"

// TeleTriage represents a tele-triage entity.
type TeleTriage struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
