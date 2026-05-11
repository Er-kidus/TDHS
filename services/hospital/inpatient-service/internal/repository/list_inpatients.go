package repository

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/model"
)

// ListInpatients retrieves all inpatient records.
func (r *Repository) ListInpatients(ctx context.Context) ([]*model.Inpatient, error) {
	return nil, nil
}
