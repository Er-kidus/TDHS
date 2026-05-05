package repository

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/model"
)

// ListPatientMovements retrieves all patient-movement records.
func (r *Repository) ListPatientMovements(ctx context.Context) ([]*model.PatientMovement, error) {
	return nil, nil
}
