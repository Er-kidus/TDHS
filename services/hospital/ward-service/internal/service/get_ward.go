package service

import (
	"context"
	"github.com/tenadam/ward-service/internal/dto"
)

// GetWard retrieves a single ward by ID.
func (s *Service) GetWard(ctx context.Context, id string) (*dto.WardResponse, error) {
	entity, err := s.repo.GetWard(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.WardResponse{ID: entity.ID}, nil
}
