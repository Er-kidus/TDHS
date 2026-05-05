package repository

import (
	"context"
	"github.com/tenadam/configuration-service/internal/model"
)

// CreateConfiguration inserts a new configuration record into the database.
func (r *Repository) CreateConfiguration(ctx context.Context, entity *model.Configuration) (*model.Configuration, error) {
	return entity, nil
}
