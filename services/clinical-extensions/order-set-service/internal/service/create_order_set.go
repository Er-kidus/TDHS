package service

import (
	"context"
	"github.com/tenadam/order-set-service/internal/dto"
	"github.com/tenadam/order-set-service/internal/model"
	"github.com/tenadam/order-set-service/internal/validator"
)

// CreateOrderSet validates and creates a new order-set.
func (s *Service) CreateOrderSet(ctx context.Context, req dto.CreateOrderSetRequest) (*dto.OrderSetResponse, error) {
	if err := validator.ValidateOrderSetCreate(req); err != nil {
		return nil, err
	}
	entity := &model.OrderSet{}
	created, err := s.repo.CreateOrderSet(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrderSetResponse{ID: created.ID}, nil
}
