package repository

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/model"
)

// UpdateDataMapping updates an existing data-mapping record in the database.
func (r *Repository) UpdateDataMapping(ctx context.Context, entity *model.DataMapping) (*model.DataMapping, error) {
	return entity, nil
}
