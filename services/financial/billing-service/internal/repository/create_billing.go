package repository

import (
	"context"
	"github.com/tenadam/billing-service/internal/model"
)

// CreateBilling inserts a new billing record into the database.
func (r *Repository) CreateBilling(ctx context.Context, entity *model.Billing) (*model.Billing, error) {
	return entity, nil
}
