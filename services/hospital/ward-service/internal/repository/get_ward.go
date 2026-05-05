package repository

import (
	"context"
	"github.com/tenadam/ward-service/internal/model"
)

// GetWard retrieves a single ward record by ID.
func (r *Repository) GetWard(ctx context.Context, id string) (*model.Ward, error) {
	return nil, nil
}
