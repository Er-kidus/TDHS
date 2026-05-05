package repository

import (
	"context"
	"github.com/tenadam/prescription-service/internal/model"
)

// UpdatePrescription updates an existing prescription record in the database.
func (r *Repository) UpdatePrescription(ctx context.Context, entity *model.Prescription) (*model.Prescription, error) {
	return entity, nil
}
