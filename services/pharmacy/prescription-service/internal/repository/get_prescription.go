package repository

import (
	"context"
	"github.com/tenadam/prescription-service/internal/model"
)

// GetPrescription retrieves a single prescription record by ID.
func (r *Repository) GetPrescription(ctx context.Context, id string) (*model.Prescription, error) {
	return nil, nil
}
