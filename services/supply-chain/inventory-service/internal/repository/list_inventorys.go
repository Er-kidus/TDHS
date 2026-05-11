package repository

import (
	"context"
	"github.com/tenadam/inventory-service/internal/model"
)

// ListInventorys retrieves all inventory records.
func (r *Repository) ListInventorys(ctx context.Context) ([]*model.Inventory, error) {
	return nil, nil
}
