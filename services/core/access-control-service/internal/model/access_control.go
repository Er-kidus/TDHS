package model

import "time"

// AccessControl represents a access-control entity.
type AccessControl struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
