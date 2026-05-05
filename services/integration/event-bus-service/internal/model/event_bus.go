package model

import "time"

// EventBus represents a event-bus entity.
type EventBus struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
