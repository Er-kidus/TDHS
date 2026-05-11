package service

import (
	"context"
	"github.com/tenadam/revenue-cycle-service/internal/dto"
	"github.com/tenadam/revenue-cycle-service/internal/model"
	"github.com/tenadam/revenue-cycle-service/internal/validator"
)

// CreateRevenueCycle validates and creates a new revenue-cycle.
func (s *Service) CreateRevenueCycle(ctx context.Context, req dto.CreateRevenueCycleRequest) (*dto.RevenueCycleResponse, error) {
	if err := validator.ValidateRevenueCycleCreate(req); err != nil {
		return nil, err
	}
	entity := &model.RevenueCycle{}
	created, err := s.repo.CreateRevenueCycle(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RevenueCycleResponse{ID: created.ID}, nil
}
