package repository

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/model"
)

// UpdateNationalReporting updates an existing national-reporting record in the database.
func (r *Repository) UpdateNationalReporting(ctx context.Context, entity *model.NationalReporting) (*model.NationalReporting, error) {
	return entity, nil
}
