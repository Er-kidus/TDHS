package model

import "time"

// NursingTask represents a nursing-task entity.
type NursingTask struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
