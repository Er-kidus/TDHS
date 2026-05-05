package repository

import (
	"context"
	"github.com/tenadam/asset-service/internal/model"
)

// UpdateAsset updates an existing asset record in the database.
func (r *Repository) UpdateAsset(ctx context.Context, entity *model.Asset) (*model.Asset, error) {
	return entity, nil
}
