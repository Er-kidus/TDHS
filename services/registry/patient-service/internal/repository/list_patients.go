package repository

import (
	"context"
	"github.com/tenadam/patient-service/internal/model"
)

// ListPatients retrieves all patient records.
func (r *Repository) ListPatients(ctx context.Context) ([]*model.Patient, error) {
	return nil, nil
}
