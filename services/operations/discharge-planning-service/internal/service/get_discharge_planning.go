package service

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/dto"
)

// GetDischargePlanning retrieves a single discharge-planning by ID.
func (s *Service) GetDischargePlanning(ctx context.Context, id string) (*dto.DischargePlanningResponse, error) {
	entity, err := s.repo.GetDischargePlanning(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DischargePlanningResponse{ID: entity.ID}, nil
}
