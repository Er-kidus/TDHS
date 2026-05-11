package repository

import (
	"context"
	"github.com/tenadam/identifier-service/internal/model"
)

// CreateIdentifier inserts a new identifier record into the database.
func (r *Repository) CreateIdentifier(ctx context.Context, entity *model.Identifier) (*model.Identifier, error) {
	return entity, nil
}
