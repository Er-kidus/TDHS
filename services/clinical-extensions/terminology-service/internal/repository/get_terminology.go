package repository

import (
	"context"
	"github.com/tenadam/terminology-service/internal/model"
)

// GetTerminology retrieves a single terminology record by ID.
func (r *Repository) GetTerminology(ctx context.Context, id string) (*model.Terminology, error) {
	return nil, nil
}
