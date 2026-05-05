package repository

import (
	"context"
	"github.com/tenadam/billing-service/internal/model"
)

// UpdateBilling updates an existing billing record in the database.
func (r *Repository) UpdateBilling(ctx context.Context, entity *model.Billing) (*model.Billing, error) {
	return entity, nil
}
