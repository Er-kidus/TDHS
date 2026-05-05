package model

import "time"

// ClaimAdjudication represents a claim-adjudication entity.
type ClaimAdjudication struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
