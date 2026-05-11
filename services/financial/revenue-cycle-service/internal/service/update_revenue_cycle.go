package service

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
	"github.com/tenadam/revenue-cycle-service/internal/model"
	"github.com/tenadam/revenue-cycle-service/internal/validator"
)

// UpdateRevenueCycle validates and updates an existing revenue-cycle.
func (s *Service) UpdateRevenueCycle(ctx context.Context, req dto.UpdateRevenueCycleRequest) (*dto.RevenueCycleResponse, error) {
	if err := validator.ValidateRevenueCycleUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.RevenueCycle{ID: req.ID}
	updated, err := s.repo.UpdateRevenueCycle(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RevenueCycleResponse{ID: updated.ID}, nil
}
