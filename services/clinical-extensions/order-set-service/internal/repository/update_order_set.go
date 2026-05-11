package repository

import (
	"context"
	"github.com/tenadam/order-set-service/internal/model"
)

// UpdateOrderSet updates an existing order-set record in the database.
func (r *Repository) UpdateOrderSet(ctx context.Context, entity *model.OrderSet) (*model.OrderSet, error) {
	return entity, nil
}
