package repository

import (
	"context"
	"github.com/tenadam/access-control-service/internal/model"
)

// CreateAccessControl inserts a new access-control record into the database.
func (r *Repository) CreateAccessControl(ctx context.Context, entity *model.AccessControl) (*model.AccessControl, error) {
	return entity, nil
}
