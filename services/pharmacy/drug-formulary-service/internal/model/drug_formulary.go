package model

import "time"

// DrugFormulary represents a drug-formulary entity.
type DrugFormulary struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
