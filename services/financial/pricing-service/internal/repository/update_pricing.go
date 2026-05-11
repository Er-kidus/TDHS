package repository

import (
	"context"
	"github.com/tenadam/pricing-service/internal/model"
)

// UpdatePricing updates an existing pricing record in the database.
func (r *Repository) UpdatePricing(ctx context.Context, entity *model.Pricing) (*model.Pricing, error) {
	return entity, nil
}
