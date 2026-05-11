package repository

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/model"
)

// ListSchedulings retrieves all scheduling records.
func (r *Repository) ListSchedulings(ctx context.Context) ([]*model.Scheduling, error) {
	return nil, nil
}
