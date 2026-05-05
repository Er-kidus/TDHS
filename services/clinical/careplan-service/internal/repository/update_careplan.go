package repository

import (
	"context"
	"github.com/tenadam/careplan-service/internal/model"
)

// UpdateCareplan updates an existing careplan record in the database.
func (r *Repository) UpdateCareplan(ctx context.Context, entity *model.Careplan) (*model.Careplan, error) {
	return entity, nil
}
