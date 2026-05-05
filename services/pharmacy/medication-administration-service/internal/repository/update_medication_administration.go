package repository

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/model"
)

// UpdateMedicationAdministration updates an existing medication-administration record in the database.
func (r *Repository) UpdateMedicationAdministration(ctx context.Context, entity *model.MedicationAdministration) (*model.MedicationAdministration, error) {
	return entity, nil
}
