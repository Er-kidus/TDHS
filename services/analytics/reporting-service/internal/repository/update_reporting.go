package repository

import (
	"context"
	"github.com/tenadam/reporting-service/internal/model"
)

// UpdateReporting updates an existing reporting record in the database.
func (r *Repository) UpdateReporting(ctx context.Context, entity *model.Reporting) (*model.Reporting, error) {
	return entity, nil
}
