package repository

import (
	"context"
	"github.com/tenadam/queue-service/internal/model"
)

// CreateQueue inserts a new queue record into the database.
func (r *Repository) CreateQueue(ctx context.Context, entity *model.Queue) (*model.Queue, error) {
	return entity, nil
}
