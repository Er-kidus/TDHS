package repository

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/model"
)

// GetPatientMovement retrieves a single patient-movement record by ID.
func (r *Repository) GetPatientMovement(ctx context.Context, id string) (*model.PatientMovement, error) {
	return nil, nil
}
