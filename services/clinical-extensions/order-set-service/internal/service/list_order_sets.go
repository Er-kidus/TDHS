package service

import (
	"context"
	"github.com/tenadam/order-set-service/internal/dto"
)

// ListOrderSets retrieves all order-sets.
func (s *Service) ListOrderSets(ctx context.Context) (*dto.ListOrderSetResponse, error) {
	entities, err := s.repo.ListOrderSets(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.OrderSetResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.OrderSetResponse{ID: e.ID})
	}
	return &dto.ListOrderSetResponse{Items: items, Total: len(items)}, nil
}
