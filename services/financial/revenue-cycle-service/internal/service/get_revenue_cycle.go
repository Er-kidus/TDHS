package service

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
)

// GetRevenueCycle retrieves a single revenue-cycle by ID.
func (s *Service) GetRevenueCycle(ctx context.Context, id string) (*dto.RevenueCycleResponse, error) {
	entity, err := s.repo.GetRevenueCycle(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.RevenueCycleResponse{ID: entity.ID}, nil
}
