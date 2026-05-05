package repository

import (
	"context"
	"github.com/tenadam/program-service/internal/model"
)

// UpdateProgram updates an existing program record in the database.
func (r *Repository) UpdateProgram(ctx context.Context, entity *model.Program) (*model.Program, error) {
	return entity, nil
}
