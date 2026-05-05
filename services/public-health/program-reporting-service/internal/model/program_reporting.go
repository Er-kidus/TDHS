package model

import "time"

// ProgramReporting represents a program-reporting entity.
type ProgramReporting struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
