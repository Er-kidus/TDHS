package repository

import (
	"context"
	"github.com/tenadam/check-in-service/internal/model"
)

// GetCheckIn retrieves a single check-in record by ID.
func (r *Repository) GetCheckIn(ctx context.Context, id string) (*model.CheckIn, error) {
	return nil, nil
}
