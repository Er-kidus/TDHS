package repository

import (
	"context"
	"github.com/tenadam/procedure-service/internal/model"
)

// UpdateProcedure updates an existing procedure record in the database.
func (r *Repository) UpdateProcedure(ctx context.Context, entity *model.Procedure) (*model.Procedure, error) {
	return entity, nil
}
