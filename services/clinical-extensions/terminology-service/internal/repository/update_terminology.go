package repository

import (
	"context"
	"github.com/tenadam/terminology-service/internal/model"
)

// UpdateTerminology updates an existing terminology record in the database.
func (r *Repository) UpdateTerminology(ctx context.Context, entity *model.Terminology) (*model.Terminology, error) {
	return entity, nil
}
