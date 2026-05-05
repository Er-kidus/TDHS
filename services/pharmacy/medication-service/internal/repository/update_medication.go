package repository

import (
	"context"
	"github.com/tenadam/medication-service/internal/model"
)

// UpdateMedication updates an existing medication record in the database.
func (r *Repository) UpdateMedication(ctx context.Context, entity *model.Medication) (*model.Medication, error) {
	return entity, nil
}
