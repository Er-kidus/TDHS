package repository

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/model"
)

// UpdateWarehouse updates an existing warehouse record in the database.
func (r *Repository) UpdateWarehouse(ctx context.Context, entity *model.Warehouse) (*model.Warehouse, error) {
	return entity, nil
}
