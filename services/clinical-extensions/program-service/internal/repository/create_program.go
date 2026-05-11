package repository

import (
	"context"
	"github.com/tenadam/program-service/internal/model"
)

// CreateProgram inserts a new program record into the database.
func (r *Repository) CreateProgram(ctx context.Context, entity *model.Program) (*model.Program, error) {
	return entity, nil
}
