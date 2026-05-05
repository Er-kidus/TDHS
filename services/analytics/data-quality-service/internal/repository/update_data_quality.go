package repository

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/model"
)

// UpdateDataQuality updates an existing data-quality record in the database.
func (r *Repository) UpdateDataQuality(ctx context.Context, entity *model.DataQuality) (*model.DataQuality, error) {
	return entity, nil
}
