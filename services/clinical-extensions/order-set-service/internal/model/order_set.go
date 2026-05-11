package model

import "time"

// OrderSet represents a order-set entity.
type OrderSet struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
