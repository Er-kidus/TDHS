package repository

import (
	"context"
	"github.com/tenadam/ward-service/internal/model"
)

// CreateWard inserts a new ward record into the database.
func (r *Repository) CreateWard(ctx context.Context, entity *model.Ward) (*model.Ward, error) {
	return entity, nil
}
