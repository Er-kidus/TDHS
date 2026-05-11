package service

import (
	"context"
	"github.com/tenadam/order-set-service/internal/dto"
)

// GetOrderSet retrieves a single order-set by ID.
func (s *Service) GetOrderSet(ctx context.Context, id string) (*dto.OrderSetResponse, error) {
	entity, err := s.repo.GetOrderSet(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.OrderSetResponse{ID: entity.ID}, nil
}
