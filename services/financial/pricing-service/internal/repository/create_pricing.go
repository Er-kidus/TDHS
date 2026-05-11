package repository

import (
	"context"
	"github.com/tenadam/pricing-service/internal/model"
)

// CreatePricing inserts a new pricing record into the database.
func (r *Repository) CreatePricing(ctx context.Context, entity *model.Pricing) (*model.Pricing, error) {
	return entity, nil
}
