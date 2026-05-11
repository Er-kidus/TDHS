package service

import (
	"context"
	"github.com/tenadam/household-service/internal/dto"
)

// GetHousehold retrieves a single household by ID.
func (s *Service) GetHousehold(ctx context.Context, id string) (*dto.HouseholdResponse, error) {
	entity, err := s.repo.GetHousehold(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.HouseholdResponse{ID: entity.ID}, nil
}
