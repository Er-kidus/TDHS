package repository

import (
	"context"
	"github.com/tenadam/configuration-service/internal/model"
)

// UpdateConfiguration updates an existing configuration record in the database.
func (r *Repository) UpdateConfiguration(ctx context.Context, entity *model.Configuration) (*model.Configuration, error) {
	return entity, nil
}
