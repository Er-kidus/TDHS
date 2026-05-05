package service

import (
	"context"
	"github.com/tenadam/order-service/internal/dto"
	"github.com/tenadam/order-service/internal/model"
	"github.com/tenadam/order-service/internal/validator"
)

// UpdateOrder validates and updates an existing order.
func (s *Service) UpdateOrder(ctx context.Context, req dto.UpdateOrderRequest) (*dto.OrderResponse, error) {
	if err := validator.ValidateOrderUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Order{ID: req.ID}
	updated, err := s.repo.UpdateOrder(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrderResponse{ID: updated.ID}, nil
}
