package repository

import (
	"context"
	"github.com/tenadam/auth-service/internal/model"
)

// UpdateAuth updates an existing auth record in the database.
func (r *Repository) UpdateAuth(ctx context.Context, entity *model.Auth) (*model.Auth, error) {
	return entity, nil
}
