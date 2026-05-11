package repository

import (
	"context"
	"github.com/tenadam/medication-service/internal/model"
)

// ListMedications retrieves all medication records.
func (r *Repository) ListMedications(ctx context.Context) ([]*model.Medication, error) {
	return nil, nil
}
