package repository

import (
	"context"
	"github.com/tenadam/result-service/internal/model"
)

// UpdateResult updates an existing result record in the database.
func (r *Repository) UpdateResult(ctx context.Context, entity *model.Result) (*model.Result, error) {
	return entity, nil
}
