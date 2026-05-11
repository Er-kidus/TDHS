package repository

import (
	"context"
	"github.com/tenadam/household-service/internal/model"
)

// GetHousehold retrieves a single household record by ID.
func (r *Repository) GetHousehold(ctx context.Context, id string) (*model.Household, error) {
	return nil, nil
}
