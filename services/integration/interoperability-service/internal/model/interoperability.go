package model

import "time"

// Interoperability represents a interoperability entity.
type Interoperability struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
