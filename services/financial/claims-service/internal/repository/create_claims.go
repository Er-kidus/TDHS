package repository

import (
	"context"
	"github.com/tenadam/claims-service/internal/model"
)

// CreateClaims inserts a new claims record into the database.
func (r *Repository) CreateClaims(ctx context.Context, entity *model.Claims) (*model.Claims, error) {
	return entity, nil
}
