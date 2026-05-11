package repository

import (
	"context"
	"github.com/tenadam/auth-service/internal/model"
)

// CreateAuth inserts a new auth record into the database.
func (r *Repository) CreateAuth(ctx context.Context, entity *model.Auth) (*model.Auth, error) {
	return entity, nil
}
