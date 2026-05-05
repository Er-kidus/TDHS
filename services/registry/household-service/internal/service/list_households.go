package service

import (
	"context"
	"github.com/tenadam/household-service/internal/dto"
)

// ListHouseholds retrieves all households.
func (s *Service) ListHouseholds(ctx context.Context) (*dto.ListHouseholdResponse, error) {
	entities, err := s.repo.ListHouseholds(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.HouseholdResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.HouseholdResponse{ID: e.ID})
	}
	return &dto.ListHouseholdResponse{Items: items, Total: len(items)}, nil
}
