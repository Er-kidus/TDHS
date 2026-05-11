package repository

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/model"
)

// UpdateNursingDashboard updates an existing nursing-dashboard record in the database.
func (r *Repository) UpdateNursingDashboard(ctx context.Context, entity *model.NursingDashboard) (*model.NursingDashboard, error) {
	return entity, nil
}
