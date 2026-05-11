package model

import "time"

// RevenueCycle represents a revenue-cycle entity.
type RevenueCycle struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
