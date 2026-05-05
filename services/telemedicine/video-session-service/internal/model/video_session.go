package model

import "time"

// VideoSession represents a video-session entity.
type VideoSession struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
