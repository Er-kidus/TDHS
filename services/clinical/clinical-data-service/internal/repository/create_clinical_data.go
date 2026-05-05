package repository

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/model"
)

// CreateClinicalData inserts a new clinical-data record into the database.
func (r *Repository) CreateClinicalData(ctx context.Context, entity *model.ClinicalData) (*model.ClinicalData, error) {
	return entity, nil
}
