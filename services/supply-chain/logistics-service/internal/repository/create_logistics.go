package repository

import (
	"context"
	"github.com/tenadam/logistics-service/internal/model"
)

// CreateLogistics inserts a new logistics record into the database.
func (r *Repository) CreateLogistics(ctx context.Context, entity *model.Logistics) (*model.Logistics, error) {
	return entity, nil
}
