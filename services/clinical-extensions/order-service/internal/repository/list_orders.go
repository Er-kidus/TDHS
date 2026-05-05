package repository

import (
	"context"
	"github.com/tenadam/order-service/internal/model"
)

// ListOrders retrieves all order records.
func (r *Repository) ListOrders(ctx context.Context) ([]*model.Order, error) {
	return nil, nil
}
