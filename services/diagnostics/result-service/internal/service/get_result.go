package service

import (
	"context"
	"github.com/tenadam/result-service/internal/dto"
)

// GetResult retrieves a single result by ID.
func (s *Service) GetResult(ctx context.Context, id string) (*dto.ResultResponse, error) {
	entity, err := s.repo.GetResult(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ResultResponse{ID: entity.ID}, nil
}
