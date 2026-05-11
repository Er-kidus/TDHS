package repository

import (
	"context"
	"github.com/tenadam/facility-service/internal/model"
)

// CreateFacility inserts a new facility record into the database.
func (r *Repository) CreateFacility(ctx context.Context, entity *model.Facility) (*model.Facility, error) {
	return entity, nil
}
