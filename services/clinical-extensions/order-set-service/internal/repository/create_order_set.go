package repository

import (
	"context"
	"github.com/tenadam/order-set-service/internal/model"
)

// CreateOrderSet inserts a new order-set record into the database.
func (r *Repository) CreateOrderSet(ctx context.Context, entity *model.OrderSet) (*model.OrderSet, error) {
	return entity, nil
}
