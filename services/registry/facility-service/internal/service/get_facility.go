package service

import (
	"context"
	"github.com/tenadam/facility-service/internal/dto"
)

// GetFacility retrieves a single facility by ID.
func (s *Service) GetFacility(ctx context.Context, id string) (*dto.FacilityResponse, error) {
	entity, err := s.repo.GetFacility(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.FacilityResponse{ID: entity.ID}, nil
}
