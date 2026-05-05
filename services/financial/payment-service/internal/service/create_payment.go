package service

import (
	"context"
	"github.com/tenadam/payment-service/internal/dto"
	"github.com/tenadam/payment-service/internal/model"
	"github.com/tenadam/payment-service/internal/validator"
)

// CreatePayment validates and creates a new payment.
func (s *Service) CreatePayment(ctx context.Context, req dto.CreatePaymentRequest) (*dto.PaymentResponse, error) {
	if err := validator.ValidatePaymentCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Payment{}
	created, err := s.repo.CreatePayment(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PaymentResponse{ID: created.ID}, nil
}
