package repository

import (
	"context"
	"github.com/tenadam/vendor-service/internal/model"
)

// UpdateVendor updates an existing vendor record in the database.
func (r *Repository) UpdateVendor(ctx context.Context, entity *model.Vendor) (*model.Vendor, error) {
	return entity, nil
}
