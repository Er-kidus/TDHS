package repository

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/model"
)

// UpdatePatientMovement updates an existing patient-movement record in the database.
func (r *Repository) UpdatePatientMovement(ctx context.Context, entity *model.PatientMovement) (*model.PatientMovement, error) {
	return entity, nil
}
