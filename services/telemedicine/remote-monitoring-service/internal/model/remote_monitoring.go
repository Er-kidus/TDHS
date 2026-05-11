package model

import "time"

// RemoteMonitoring represents a remote-monitoring entity.
type RemoteMonitoring struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
