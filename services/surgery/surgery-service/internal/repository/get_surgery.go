package repository

import (
	"context"
	"github.com/tenadam/surgery-service/internal/model"
)

// GetSurgery retrieves a single surgery record by ID.
func (r *Repository) GetSurgery(ctx context.Context, id string) (*model.Surgery, error) {
	return nil, nil
}
