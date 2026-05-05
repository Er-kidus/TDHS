package repository

import (
	"context"
	"github.com/tenadam/billing-service/internal/model"
)

// GetBilling retrieves a single billing record by ID.
func (r *Repository) GetBilling(ctx context.Context, id string) (*model.Billing, error) {
	return nil, nil
}
