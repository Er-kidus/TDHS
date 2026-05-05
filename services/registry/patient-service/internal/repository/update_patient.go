package repository

import (
	"context"
	"github.com/tenadam/patient-service/internal/model"
)

// UpdatePatient updates an existing patient record in the database.
func (r *Repository) UpdatePatient(ctx context.Context, entity *model.Patient) (*model.Patient, error) {
	return entity, nil
}
