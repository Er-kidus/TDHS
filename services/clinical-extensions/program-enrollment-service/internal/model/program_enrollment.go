package model

import "time"

// ProgramEnrollment represents a program-enrollment entity.
type ProgramEnrollment struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
