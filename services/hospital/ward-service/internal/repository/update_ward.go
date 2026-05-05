package repository

import (
	"context"
	"github.com/tenadam/ward-service/internal/model"
)

// UpdateWard updates an existing ward record in the database.
func (r *Repository) UpdateWard(ctx context.Context, entity *model.Ward) (*model.Ward, error) {
	return entity, nil
}
