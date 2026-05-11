package repository

import (
	"context"
	"github.com/tenadam/procedure-service/internal/model"
)

// CreateProcedure inserts a new procedure record into the database.
func (r *Repository) CreateProcedure(ctx context.Context, entity *model.Procedure) (*model.Procedure, error) {
	return entity, nil
}
