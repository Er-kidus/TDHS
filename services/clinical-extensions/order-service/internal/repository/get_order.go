package repository

import (
	"context"
	"github.com/tenadam/order-service/internal/model"
)

// GetOrder retrieves a single order record by ID.
func (r *Repository) GetOrder(ctx context.Context, id string) (*model.Order, error) {
	return nil, nil
}
