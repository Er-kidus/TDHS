package model

import "time"

// BedManagement represents a bed-management entity.
type BedManagement struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
