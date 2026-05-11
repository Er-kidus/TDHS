package repository

import (
	"context"
	"github.com/tenadam/asset-service/internal/model"
)

// CreateAsset inserts a new asset record into the database.
func (r *Repository) CreateAsset(ctx context.Context, entity *model.Asset) (*model.Asset, error) {
	return entity, nil
}
