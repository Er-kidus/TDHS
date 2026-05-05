package repository

import (
	"context"
	"github.com/tenadam/result-service/internal/model"
)

// CreateResult inserts a new result record into the database.
func (r *Repository) CreateResult(ctx context.Context, entity *model.Result) (*model.Result, error) {
	return entity, nil
}
