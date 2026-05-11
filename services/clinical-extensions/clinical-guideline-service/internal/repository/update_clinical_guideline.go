package repository

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/model"
)

// UpdateClinicalGuideline updates an existing clinical-guideline record in the database.
func (r *Repository) UpdateClinicalGuideline(ctx context.Context, entity *model.ClinicalGuideline) (*model.ClinicalGuideline, error) {
	return entity, nil
}
