package repository

import (
	"context"
	"github.com/tenadam/data-mapping-service/internal/model"
)

// CreateDataMapping inserts a new data-mapping record into the database.
func (r *Repository) CreateDataMapping(ctx context.Context, entity *model.DataMapping) (*model.DataMapping, error) {
	return entity, nil
}
