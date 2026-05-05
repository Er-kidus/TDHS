package repository

import (
	"context"
	"github.com/tenadam/access-control-service/internal/model"
)

// UpdateAccessControl updates an existing access-control record in the database.
func (r *Repository) UpdateAccessControl(ctx context.Context, entity *model.AccessControl) (*model.AccessControl, error) {
	return entity, nil
}
