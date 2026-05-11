package repository

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/model"
)

// ListMedicationAdministrations retrieves all medication-administration records.
func (r *Repository) ListMedicationAdministrations(ctx context.Context) ([]*model.MedicationAdministration, error) {
	return nil, nil
}
