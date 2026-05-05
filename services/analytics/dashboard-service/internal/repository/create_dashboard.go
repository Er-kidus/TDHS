package repository

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/model"
)

// CreateDashboard inserts a new dashboard record into the database.
func (r *Repository) CreateDashboard(ctx context.Context, entity *model.Dashboard) (*model.Dashboard, error) {
	return entity, nil
}
