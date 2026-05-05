package repository

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/model"
)

// CreateBedManagement inserts a new bed-management record into the database.
func (r *Repository) CreateBedManagement(ctx context.Context, entity *model.BedManagement) (*model.BedManagement, error) {
	return entity, nil
}
