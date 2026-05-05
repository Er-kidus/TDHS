package service

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/dto"
)

// GetScheduling retrieves a single scheduling by ID.
func (s *Service) GetScheduling(ctx context.Context, id string) (*dto.SchedulingResponse, error) {
	entity, err := s.repo.GetScheduling(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SchedulingResponse{ID: entity.ID}, nil
}
