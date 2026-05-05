package repository

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/model"
)

// ListEventBuss retrieves all event-bus records.
func (r *Repository) ListEventBuss(ctx context.Context) ([]*model.EventBus, error) {
	return nil, nil
}
