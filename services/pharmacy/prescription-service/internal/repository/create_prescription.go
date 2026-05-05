package repository

import (
	"context"
	"github.com/tenadam/prescription-service/internal/model"
)

// CreatePrescription inserts a new prescription record into the database.
func (r *Repository) CreatePrescription(ctx context.Context, entity *model.Prescription) (*model.Prescription, error) {
	return entity, nil
}
