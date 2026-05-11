package service

import (
	"context"
	"github.com/tenadam/payment-service/internal/dto"
)

// ListPayments retrieves all payments.
func (s *Service) ListPayments(ctx context.Context) (*dto.ListPaymentResponse, error) {
	entities, err := s.repo.ListPayments(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PaymentResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PaymentResponse{ID: e.ID})
	}
	return &dto.ListPaymentResponse{Items: items, Total: len(items)}, nil
}
