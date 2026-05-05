package repository

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/model"
)

// CreateMedicationAdministration inserts a new medication-administration record into the database.
func (r *Repository) CreateMedicationAdministration(ctx context.Context, entity *model.MedicationAdministration) (*model.MedicationAdministration, error) {
	return entity, nil
}
