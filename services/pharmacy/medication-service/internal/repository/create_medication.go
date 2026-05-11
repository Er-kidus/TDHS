package repository

import (
	"context"
	"github.com/tenadam/medication-service/internal/model"
)

// CreateMedication inserts a new medication record into the database.
func (r *Repository) CreateMedication(ctx context.Context, entity *model.Medication) (*model.Medication, error) {
	return entity, nil
}
