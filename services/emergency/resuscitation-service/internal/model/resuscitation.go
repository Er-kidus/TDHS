package model

import "time"

// Resuscitation represents a resuscitation entity.
type Resuscitation struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
