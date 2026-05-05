package service

import (
	"context"
	"github.com/tenadam/billing-service/internal/dto"
	"github.com/tenadam/billing-service/internal/model"
	"github.com/tenadam/billing-service/internal/validator"
)

// UpdateBilling validates and updates an existing billing.
func (s *Service) UpdateBilling(ctx context.Context, req dto.UpdateBillingRequest) (*dto.BillingResponse, error) {
	if err := validator.ValidateBillingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Billing{ID: req.ID}
	updated, err := s.repo.UpdateBilling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.BillingResponse{ID: updated.ID}, nil
}
