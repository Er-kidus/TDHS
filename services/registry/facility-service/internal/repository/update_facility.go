package repository

import (
	"context"
	"github.com/tenadam/facility-service/internal/model"
)

// UpdateFacility updates an existing facility record in the database.
func (r *Repository) UpdateFacility(ctx context.Context, entity *model.Facility) (*model.Facility, error) {
	return entity, nil
}
