package repository

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/model"
)

// UpdateBedManagement updates an existing bed-management record in the database.
func (r *Repository) UpdateBedManagement(ctx context.Context, entity *model.BedManagement) (*model.BedManagement, error) {
	return entity, nil
}
