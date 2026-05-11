package repository

import (
	"context"
	"github.com/tenadam/specimen-service/internal/model"
)

// GetSpecimen retrieves a single specimen record by ID.
func (r *Repository) GetSpecimen(ctx context.Context, id string) (*model.Specimen, error) {
	return nil, nil
}
