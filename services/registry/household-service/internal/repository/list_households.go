package repository

import (
	"context"
	"github.com/tenadam/household-service/internal/model"
)

// ListHouseholds retrieves all household records.
func (r *Repository) ListHouseholds(ctx context.Context) ([]*model.Household, error) {
	return nil, nil
}
