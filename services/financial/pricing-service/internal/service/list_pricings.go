package service

import (
	"context"
	"github.com/tenadam/pricing-service/internal/dto"
)

// ListPricings retrieves all pricings.
func (s *Service) ListPricings(ctx context.Context) (*dto.ListPricingResponse, error) {
	entities, err := s.repo.ListPricings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PricingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PricingResponse{ID: e.ID})
	}
	return &dto.ListPricingResponse{Items: items, Total: len(items)}, nil
}
