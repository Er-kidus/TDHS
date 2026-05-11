package service

import (
	"context"
	"github.com/tenadam/careplan-service/internal/dto"
)

// GetCareplan retrieves a single careplan by ID.
func (s *Service) GetCareplan(ctx context.Context, id string) (*dto.CareplanResponse, error) {
	entity, err := s.repo.GetCareplan(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.CareplanResponse{ID: entity.ID}, nil
}
