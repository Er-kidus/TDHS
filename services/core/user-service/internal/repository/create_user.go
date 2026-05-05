package repository

import (
	"context"
	"github.com/tenadam/user-service/internal/model"
)

// CreateUser inserts a new user record into the database.
func (r *Repository) CreateUser(ctx context.Context, entity *model.User) (*model.User, error) {
	return entity, nil
}
