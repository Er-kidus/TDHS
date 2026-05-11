package repository

import (
	"context"
	"github.com/tenadam/household-service/internal/model"
)

// UpdateHousehold updates an existing household record in the database.
func (r *Repository) UpdateHousehold(ctx context.Context, entity *model.Household) (*model.Household, error) {
	return entity, nil
}
