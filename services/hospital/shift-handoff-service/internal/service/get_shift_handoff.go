package service

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/dto"
)

// GetShiftHandoff retrieves a single shift-handoff by ID.
func (s *Service) GetShiftHandoff(ctx context.Context, id string) (*dto.ShiftHandoffResponse, error) {
	entity, err := s.repo.GetShiftHandoff(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ShiftHandoffResponse{ID: entity.ID}, nil
}
