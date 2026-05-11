package repository

import (
	"context"
	"github.com/tenadam/procedure-service/internal/model"
)

// GetProcedure retrieves a single procedure record by ID.
func (r *Repository) GetProcedure(ctx context.Context, id string) (*model.Procedure, error) {
	return nil, nil
}
