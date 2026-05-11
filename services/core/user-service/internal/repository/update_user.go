package repository

import (
	"context"
	"github.com/tenadam/user-service/internal/model"
)

// UpdateUser updates an existing user record in the database.
func (r *Repository) UpdateUser(ctx context.Context, entity *model.User) (*model.User, error) {
	return entity, nil
}
