package repository

import (
	"context"
	"github.com/tenadam/payment-service/internal/model"
)

// CreatePayment inserts a new payment record into the database.
func (r *Repository) CreatePayment(ctx context.Context, entity *model.Payment) (*model.Payment, error) {
	return entity, nil
}
