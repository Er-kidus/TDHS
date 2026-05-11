package repository

import (
	"context"
	"github.com/tenadam/program-service/internal/model"
)

// GetProgram retrieves a single program record by ID.
func (r *Repository) GetProgram(ctx context.Context, id string) (*model.Program, error) {
	return nil, nil
}
