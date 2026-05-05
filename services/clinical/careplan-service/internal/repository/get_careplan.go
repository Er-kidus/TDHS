package repository

import (
	"context"
	"github.com/tenadam/careplan-service/internal/model"
)

// GetCareplan retrieves a single careplan record by ID.
func (r *Repository) GetCareplan(ctx context.Context, id string) (*model.Careplan, error) {
	return nil, nil
}
