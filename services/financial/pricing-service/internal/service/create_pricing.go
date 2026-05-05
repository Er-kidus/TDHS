package service

import (
	"context"
	"github.com/tenadam/pricing-service/internal/dto"
	"github.com/tenadam/pricing-service/internal/model"
	"github.com/tenadam/pricing-service/internal/validator"
)

// CreatePricing validates and creates a new pricing.
func (s *Service) CreatePricing(ctx context.Context, req dto.CreatePricingRequest) (*dto.PricingResponse, error) {
	if err := validator.ValidatePricingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Pricing{}
	created, err := s.repo.CreatePricing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PricingResponse{ID: created.ID}, nil
}
