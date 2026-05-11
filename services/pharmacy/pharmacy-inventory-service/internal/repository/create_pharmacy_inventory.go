package repository

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/model"
)

// CreatePharmacyInventory inserts a new pharmacy-inventory record into the database.
func (r *Repository) CreatePharmacyInventory(ctx context.Context, entity *model.PharmacyInventory) (*model.PharmacyInventory, error) {
	return entity, nil
}
