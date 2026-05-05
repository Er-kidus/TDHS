package service

import (
	"context"
	"github.com/tenadam/billing-service/internal/dto"
)

// GetBilling retrieves a single billing by ID.
func (s *Service) GetBilling(ctx context.Context, id string) (*dto.BillingResponse, error) {
	entity, err := s.repo.GetBilling(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.BillingResponse{ID: entity.ID}, nil
}
