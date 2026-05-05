package repository

import (
	"context"
	"github.com/tenadam/claims-service/internal/model"
)

// UpdateClaims updates an existing claims record in the database.
func (r *Repository) UpdateClaims(ctx context.Context, entity *model.Claims) (*model.Claims, error) {
	return entity, nil
}
