package repository

import (
	"context"
	"github.com/tenadam/patient-service/internal/model"
)

// GetPatient retrieves a single patient record by ID.
func (r *Repository) GetPatient(ctx context.Context, id string) (*model.Patient, error) {
	return nil, nil
}
