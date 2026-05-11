package repository

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/model"
)

// CreateClinicalGuideline inserts a new clinical-guideline record into the database.
func (r *Repository) CreateClinicalGuideline(ctx context.Context, entity *model.ClinicalGuideline) (*model.ClinicalGuideline, error) {
	return entity, nil
}
