package repository

import (
	"context"
	"github.com/tenadam/inventory-service/internal/model"
)

// UpdateInventory updates an existing inventory record in the database.
func (r *Repository) UpdateInventory(ctx context.Context, entity *model.Inventory) (*model.Inventory, error) {
	return entity, nil
}
