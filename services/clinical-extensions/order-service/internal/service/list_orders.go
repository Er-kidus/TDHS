package service

import (
	"context"
	"github.com/tenadam/order-service/internal/dto"
)

// ListOrders retrieves all orders.
func (s *Service) ListOrders(ctx context.Context) (*dto.ListOrderResponse, error) {
	entities, err := s.repo.ListOrders(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.OrderResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.OrderResponse{ID: e.ID})
	}
	return &dto.ListOrderResponse{Items: items, Total: len(items)}, nil
}
