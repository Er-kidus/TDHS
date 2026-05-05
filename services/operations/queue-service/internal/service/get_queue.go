package service

import (
	"context"
	"github.com/tenadam/queue-service/internal/dto"
)

// GetQueue retrieves a single queue by ID.
func (s *Service) GetQueue(ctx context.Context, id string) (*dto.QueueResponse, error) {
	entity, err := s.repo.GetQueue(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.QueueResponse{ID: entity.ID}, nil
}
