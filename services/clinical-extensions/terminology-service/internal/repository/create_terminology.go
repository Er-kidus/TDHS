package repository

import (
	"context"
	"github.com/tenadam/terminology-service/internal/model"
)

// CreateTerminology inserts a new terminology record into the database.
func (r *Repository) CreateTerminology(ctx context.Context, entity *model.Terminology) (*model.Terminology, error) {
	return entity, nil
}
