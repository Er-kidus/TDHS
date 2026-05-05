package model

import "time"

// FlowBoard represents a flow-board entity.
type FlowBoard struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
