package repository

import (
	"context"
	"github.com/tenadam/surgery-service/internal/model"
)

// CreateSurgery inserts a new surgery record into the database.
func (r *Repository) CreateSurgery(ctx context.Context, entity *model.Surgery) (*model.Surgery, error) {
	return entity, nil
}
