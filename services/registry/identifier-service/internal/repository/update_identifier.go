package repository

import (
	"context"
	"github.com/tenadam/identifier-service/internal/model"
)

// UpdateIdentifier updates an existing identifier record in the database.
func (r *Repository) UpdateIdentifier(ctx context.Context, entity *model.Identifier) (*model.Identifier, error) {
	return entity, nil
}
