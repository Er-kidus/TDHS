package service

import (
	"context"
	"github.com/tenadam/logistics-service/internal/dto"
)

// GetLogistics retrieves a single logistics by ID.
func (s *Service) GetLogistics(ctx context.Context, id string) (*dto.LogisticsResponse, error) {
	entity, err := s.repo.GetLogistics(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.LogisticsResponse{ID: entity.ID}, nil
}
