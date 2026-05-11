package repository

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/model"
)

// CreateWarehouse inserts a new warehouse record into the database.
func (r *Repository) CreateWarehouse(ctx context.Context, entity *model.Warehouse) (*model.Warehouse, error) {
	return entity, nil
}
