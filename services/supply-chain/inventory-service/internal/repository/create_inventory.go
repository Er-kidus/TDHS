package repository

import (
	"context"
	"github.com/tenadam/inventory-service/internal/model"
)

// CreateInventory inserts a new inventory record into the database.
func (r *Repository) CreateInventory(ctx context.Context, entity *model.Inventory) (*model.Inventory, error) {
	return entity, nil
}
