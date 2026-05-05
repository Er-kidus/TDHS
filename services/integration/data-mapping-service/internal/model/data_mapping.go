package model

import "time"

// DataMapping represents a data-mapping entity.
type DataMapping struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
