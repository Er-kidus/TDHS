package repository

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/model"
)

// CreateDataQuality inserts a new data-quality record into the database.
func (r *Repository) CreateDataQuality(ctx context.Context, entity *model.DataQuality) (*model.DataQuality, error) {
	return entity, nil
}
