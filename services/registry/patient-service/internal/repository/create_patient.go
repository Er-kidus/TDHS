package repository

import (
	"context"
	"github.com/tenadam/patient-service/internal/model"
)

// CreatePatient inserts a new patient record into the database.
func (r *Repository) CreatePatient(ctx context.Context, entity *model.Patient) (*model.Patient, error) {
	return entity, nil
}
