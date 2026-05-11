package model

import "time"

// OutbreakDetection represents a outbreak-detection entity.
type OutbreakDetection struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
