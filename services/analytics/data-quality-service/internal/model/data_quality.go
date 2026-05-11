package model

import "time"

// DataQuality represents a data-quality entity.
type DataQuality struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
