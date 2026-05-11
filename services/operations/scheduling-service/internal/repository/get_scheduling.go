package repository

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/model"
)

// GetScheduling retrieves a single scheduling record by ID.
func (r *Repository) GetScheduling(ctx context.Context, id string) (*model.Scheduling, error) {
	return nil, nil
}
