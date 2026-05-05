package repository

import (
	"context"
	"github.com/tenadam/procurement-service/internal/model"
)

// GetProcurement retrieves a single procurement record by ID.
func (r *Repository) GetProcurement(ctx context.Context, id string) (*model.Procurement, error) {
	return nil, nil
}
