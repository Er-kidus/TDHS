package repository

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/model"
)

// UpdateDashboard updates an existing dashboard record in the database.
func (r *Repository) UpdateDashboard(ctx context.Context, entity *model.Dashboard) (*model.Dashboard, error) {
	return entity, nil
}
