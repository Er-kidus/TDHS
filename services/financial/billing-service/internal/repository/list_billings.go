package repository

import (
	"context"
	"github.com/tenadam/billing-service/internal/model"
)

// ListBillings retrieves all billing records.
func (r *Repository) ListBillings(ctx context.Context) ([]*model.Billing, error) {
	return nil, nil
}
