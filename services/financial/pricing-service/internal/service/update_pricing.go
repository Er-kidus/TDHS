package service

import (
	"context"
	"github.com/tenadam/pricing-service/internal/dto"
	"github.com/tenadam/pricing-service/internal/model"
	"github.com/tenadam/pricing-service/internal/validator"
)

// UpdatePricing validates and updates an existing pricing.
func (s *Service) UpdatePricing(ctx context.Context, req dto.UpdatePricingRequest) (*dto.PricingResponse, error) {
	if err := validator.ValidatePricingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Pricing{ID: req.ID}
	updated, err := s.repo.UpdatePricing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PricingResponse{ID: updated.ID}, nil
}
