package service

import (
	"context"
	"github.com/tenadam/pricing-service/internal/dto"
)

// GetPricing retrieves a single pricing by ID.
func (s *Service) GetPricing(ctx context.Context, id string) (*dto.PricingResponse, error) {
	entity, err := s.repo.GetPricing(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PricingResponse{ID: entity.ID}, nil
}
