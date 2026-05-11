package repository

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/model"
)

// CreateEventBus inserts a new event-bus record into the database.
func (r *Repository) CreateEventBus(ctx context.Context, entity *model.EventBus) (*model.EventBus, error) {
	return entity, nil
}
