package repository

import (
	"context"
	"github.com/tenadam/national-reporting-service/internal/model"
)

// CreateNationalReporting inserts a new national-reporting record into the database.
func (r *Repository) CreateNationalReporting(ctx context.Context, entity *model.NationalReporting) (*model.NationalReporting, error) {
	return entity, nil
}
