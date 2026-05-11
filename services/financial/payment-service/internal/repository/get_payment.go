package repository

import (
	"context"
	"github.com/tenadam/payment-service/internal/model"
)

// GetPayment retrieves a single payment record by ID.
func (r *Repository) GetPayment(ctx context.Context, id string) (*model.Payment, error) {
	return nil, nil
}
