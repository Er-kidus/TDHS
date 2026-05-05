package repository

import (
	"context"
	"github.com/tenadam/clinical-guideline-service/internal/model"
)

// ListClinicalGuidelines retrieves all clinical-guideline records.
func (r *Repository) ListClinicalGuidelines(ctx context.Context) ([]*model.ClinicalGuideline, error) {
	return nil, nil
}
