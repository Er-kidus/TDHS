package service

import (
	"context"
	"github.com/tenadam/order-service/internal/dto"
	"github.com/tenadam/order-service/internal/model"
	"github.com/tenadam/order-service/internal/validator"
)

// CreateOrder validates and creates a new order.
func (s *Service) CreateOrder(ctx context.Context, req dto.CreateOrderRequest) (*dto.OrderResponse, error) {
	if err := validator.ValidateOrderCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Order{}
	created, err := s.repo.CreateOrder(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrderResponse{ID: created.ID}, nil
}
