package service

import (
	"context"
	"github.com/tenadam/check-in-service/internal/dto"
)

// GetCheckIn retrieves a single check-in by ID.
func (s *Service) GetCheckIn(ctx context.Context, id string) (*dto.CheckInResponse, error) {
	entity, err := s.repo.GetCheckIn(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.CheckInResponse{ID: entity.ID}, nil
}
