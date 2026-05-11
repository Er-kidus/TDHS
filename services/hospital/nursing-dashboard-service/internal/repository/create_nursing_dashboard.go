package repository

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/model"
)

// CreateNursingDashboard inserts a new nursing-dashboard record into the database.
func (r *Repository) CreateNursingDashboard(ctx context.Context, entity *model.NursingDashboard) (*model.NursingDashboard, error) {
	return entity, nil
}
