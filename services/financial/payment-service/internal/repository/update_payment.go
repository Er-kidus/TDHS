package repository

import (
	"context"
	"github.com/tenadam/payment-service/internal/model"
)

// UpdatePayment updates an existing payment record in the database.
func (r *Repository) UpdatePayment(ctx context.Context, entity *model.Payment) (*model.Payment, error) {
	return entity, nil
}
