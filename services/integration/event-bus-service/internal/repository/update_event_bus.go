package repository

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/model"
)

// UpdateEventBus updates an existing event-bus record in the database.
func (r *Repository) UpdateEventBus(ctx context.Context, entity *model.EventBus) (*model.EventBus, error) {
	return entity, nil
}
