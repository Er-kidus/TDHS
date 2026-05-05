package repository

import (
	"context"
	"github.com/tenadam/analytics-service/internal/model"
)

// CreateAnalytics inserts a new analytics record into the database.
func (r *Repository) CreateAnalytics(ctx context.Context, entity *model.Analytics) (*model.Analytics, error) {
	return entity, nil
}
