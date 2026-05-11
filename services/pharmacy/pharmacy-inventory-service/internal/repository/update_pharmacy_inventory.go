package repository

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/model"
)

// UpdatePharmacyInventory updates an existing pharmacy-inventory record in the database.
func (r *Repository) UpdatePharmacyInventory(ctx context.Context, entity *model.PharmacyInventory) (*model.PharmacyInventory, error) {
	return entity, nil
}
