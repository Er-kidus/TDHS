package repository

import (
	"context"
	"github.com/tenadam/medication-service/internal/model"
)

// GetMedication retrieves a single medication record by ID.
func (r *Repository) GetMedication(ctx context.Context, id string) (*model.Medication, error) {
	return nil, nil
}
