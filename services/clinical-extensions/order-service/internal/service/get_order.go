package service

import (
	"context"
	"github.com/tenadam/order-service/internal/dto"
)

// GetOrder retrieves a single order by ID.
func (s *Service) GetOrder(ctx context.Context, id string) (*dto.OrderResponse, error) {
	entity, err := s.repo.GetOrder(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.OrderResponse{ID: entity.ID}, nil
}
