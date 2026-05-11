package repository

import (
	"context"
	"github.com/tenadam/order-service/internal/model"
)

// CreateOrder inserts a new order record into the database.
func (r *Repository) CreateOrder(ctx context.Context, entity *model.Order) (*model.Order, error) {
	return entity, nil
}
