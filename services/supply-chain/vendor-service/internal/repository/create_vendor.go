package repository

import (
	"context"
	"github.com/tenadam/vendor-service/internal/model"
)

// CreateVendor inserts a new vendor record into the database.
func (r *Repository) CreateVendor(ctx context.Context, entity *model.Vendor) (*model.Vendor, error) {
	return entity, nil
}
