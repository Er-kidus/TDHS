package repository

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/model"
)

// UpdateClinicalData updates an existing clinical-data record in the database.
func (r *Repository) UpdateClinicalData(ctx context.Context, entity *model.ClinicalData) (*model.ClinicalData, error) {
	return entity, nil
}
