package service

import (
	"context"
	"github.com/tenadam/payment-service/internal/dto"
	"github.com/tenadam/payment-service/internal/model"
	"github.com/tenadam/payment-service/internal/validator"
)

// UpdatePayment validates and updates an existing payment.
func (s *Service) UpdatePayment(ctx context.Context, req dto.UpdatePaymentRequest) (*dto.PaymentResponse, error) {
	if err := validator.ValidatePaymentUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Payment{ID: req.ID}
	updated, err := s.repo.UpdatePayment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PaymentResponse{ID: updated.ID}, nil
}
