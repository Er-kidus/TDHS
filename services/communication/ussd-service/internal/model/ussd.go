package model

import "time"

// Ussd represents a ussd entity.
type Ussd struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
