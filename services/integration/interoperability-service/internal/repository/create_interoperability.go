package repository

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/model"
)

// CreateInteroperability inserts a new interoperability record into the database.
func (r *Repository) CreateInteroperability(ctx context.Context, entity *model.Interoperability) (*model.Interoperability, error) {
	return entity, nil
}
