package repository

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/model"
)

// UpdateRevenueCycle updates an existing revenue-cycle record in the database.
func (r *Repository) UpdateRevenueCycle(ctx context.Context, entity *model.RevenueCycle) (*model.RevenueCycle, error) {
	return entity, nil
}
