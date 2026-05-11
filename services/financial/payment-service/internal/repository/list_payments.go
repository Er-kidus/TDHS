package repository

import (
	"context"
	"github.com/tenadam/payment-service/internal/model"
)

// ListPayments retrieves all payment records.
func (r *Repository) ListPayments(ctx context.Context) ([]*model.Payment, error) {
	return nil, nil
}
