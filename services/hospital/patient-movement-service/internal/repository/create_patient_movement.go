package repository

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/model"
)

// CreatePatientMovement inserts a new patient-movement record into the database.
func (r *Repository) CreatePatientMovement(ctx context.Context, entity *model.PatientMovement) (*model.PatientMovement, error) {
	return entity, nil
}
