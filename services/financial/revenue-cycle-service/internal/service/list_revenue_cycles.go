package service

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
)

// ListRevenueCycles retrieves all revenue-cycles.
func (s *Service) ListRevenueCycles(ctx context.Context) (*dto.ListRevenueCycleResponse, error) {
	entities, err := s.repo.ListRevenueCycles(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.RevenueCycleResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.RevenueCycleResponse{ID: e.ID})
	}
	return &dto.ListRevenueCycleResponse{Items: items, Total: len(items)}, nil
}
