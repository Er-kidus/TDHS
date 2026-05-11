package repository

import (
	"context"
	"github.com/tenadam/nursing-service/internal/model"
)

// GetNursing retrieves a single nursing record by ID.
func (r *Repository) GetNursing(ctx context.Context, id string) (*model.Nursing, error) {
	return nil, nil
}
