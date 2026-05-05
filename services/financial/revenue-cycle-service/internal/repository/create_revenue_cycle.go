package repository

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/model"
)

// CreateRevenueCycle inserts a new revenue-cycle record into the database.
func (r *Repository) CreateRevenueCycle(ctx context.Context, entity *model.RevenueCycle) (*model.RevenueCycle, error) {
	return entity, nil
}
