package repository

import (
	"context"
	"github.com/tenadam/vendor-service/internal/model"
)

// GetVendor retrieves a single vendor record by ID.
func (r *Repository) GetVendor(ctx context.Context, id string) (*model.Vendor, error) {
	return nil, nil
}
