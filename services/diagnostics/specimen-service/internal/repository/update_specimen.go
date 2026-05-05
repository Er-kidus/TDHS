package repository

import (
	"context"
	"github.com/tenadam/specimen-service/internal/model"
)

// UpdateSpecimen updates an existing specimen record in the database.
func (r *Repository) UpdateSpecimen(ctx context.Context, entity *model.Specimen) (*model.Specimen, error) {
	return entity, nil
}
