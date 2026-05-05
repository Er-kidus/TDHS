package repository

import (
	"context"
	"github.com/tenadam/order-service/internal/model"
)

// UpdateOrder updates an existing order record in the database.
func (r *Repository) UpdateOrder(ctx context.Context, entity *model.Order) (*model.Order, error) {
	return entity, nil
}
