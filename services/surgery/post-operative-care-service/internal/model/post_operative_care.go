package model

import "time"

// PostOperativeCare represents a post-operative-care entity.
type PostOperativeCare struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
