package model

import "time"

// NationalReporting represents a national-reporting entity.
type NationalReporting struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
