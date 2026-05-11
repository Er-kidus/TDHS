package repository

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/model"
)

// GetInpatient retrieves a single inpatient record by ID.
func (r *Repository) GetInpatient(ctx context.Context, id string) (*model.Inpatient, error) {
	return nil, nil
}
