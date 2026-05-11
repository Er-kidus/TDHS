package service

import (
	"context"
	"github.com/tenadam/billing-service/internal/dto"
)

// ListBillings retrieves all billings.
func (s *Service) ListBillings(ctx context.Context) (*dto.ListBillingResponse, error) {
	entities, err := s.repo.ListBillings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.BillingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.BillingResponse{ID: e.ID})
	}
	return &dto.ListBillingResponse{Items: items, Total: len(items)}, nil
}
