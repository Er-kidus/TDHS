package repository

import (
	"context"
	"github.com/tenadam/reporting-service/internal/model"
)

// CreateReporting inserts a new reporting record into the database.
func (r *Repository) CreateReporting(ctx context.Context, entity *model.Reporting) (*model.Reporting, error) {
	return entity, nil
}
