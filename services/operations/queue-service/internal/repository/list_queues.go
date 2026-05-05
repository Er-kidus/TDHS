package repository

import (
	"context"
	"github.com/tenadam/queue-service/internal/model"
)

// ListQueues retrieves all queue records.
func (r *Repository) ListQueues(ctx context.Context) ([]*model.Queue, error) {
	return nil, nil
}
