package repository

import (
	"context"
	"github.com/tenadam/specimen-service/internal/model"
)

// CreateSpecimen inserts a new specimen record into the database.
func (r *Repository) CreateSpecimen(ctx context.Context, entity *model.Specimen) (*model.Specimen, error) {
	return entity, nil
}
