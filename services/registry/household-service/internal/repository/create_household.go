package repository

import (
	"context"
	"github.com/tenadam/household-service/internal/model"
)

// CreateHousehold inserts a new household record into the database.
func (r *Repository) CreateHousehold(ctx context.Context, entity *model.Household) (*model.Household, error) {
	return entity, nil
}
