package service

import (
	"context"
	"github.com/tenadam/payment-service/internal/dto"
)

// GetPayment retrieves a single payment by ID.
func (s *Service) GetPayment(ctx context.Context, id string) (*dto.PaymentResponse, error) {
	entity, err := s.repo.GetPayment(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PaymentResponse{ID: entity.ID}, nil
}
