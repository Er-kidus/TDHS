package service

import (
	"context"
	"github.com/tenadam/order-set-service/internal/dto"
	"github.com/tenadam/order-set-service/internal/model"
	"github.com/tenadam/order-set-service/internal/validator"
)

// UpdateOrderSet validates and updates an existing order-set.
func (s *Service) UpdateOrderSet(ctx context.Context, req dto.UpdateOrderSetRequest) (*dto.OrderSetResponse, error) {
	if err := validator.ValidateOrderSetUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.OrderSet{ID: req.ID}
	updated, err := s.repo.UpdateOrderSet(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.OrderSetResponse{ID: updated.ID}, nil
}
