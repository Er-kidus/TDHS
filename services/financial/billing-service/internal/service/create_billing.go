package service

import (
	"context"
	"github.com/tenadam/billing-service/internal/dto"
	"github.com/tenadam/billing-service/internal/model"
	"github.com/tenadam/billing-service/internal/validator"
)

// CreateBilling validates and creates a new billing.
func (s *Service) CreateBilling(ctx context.Context, req dto.CreateBillingRequest) (*dto.BillingResponse, error) {
	if err := validator.ValidateBillingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Billing{}
	created, err := s.repo.CreateBilling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.BillingResponse{ID: created.ID}, nil
}
