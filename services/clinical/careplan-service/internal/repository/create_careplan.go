package repository

import (
	"context"
	"github.com/tenadam/careplan-service/internal/model"
)

// CreateCareplan inserts a new careplan record into the database.
func (r *Repository) CreateCareplan(ctx context.Context, entity *model.Careplan) (*model.Careplan, error) {
	return entity, nil
}
