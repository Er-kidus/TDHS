package repository

import (
	"context"
	"github.com/tenadam/queue-service/internal/model"
)

// UpdateQueue updates an existing queue record in the database.
func (r *Repository) UpdateQueue(ctx context.Context, entity *model.Queue) (*model.Queue, error) {
	return entity, nil
}
