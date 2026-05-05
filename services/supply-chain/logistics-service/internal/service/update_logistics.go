package service

import (
	"context"
	"github.com/tenadam/logistics-service/internal/dto"
	"github.com/tenadam/logistics-service/internal/model"
	"github.com/tenadam/logistics-service/internal/validator"
)

// UpdateLogistics validates and updates an existing logistics.
func (s *Service) UpdateLogistics(ctx context.Context, req dto.UpdateLogisticsRequest) (*dto.LogisticsResponse, error) {
	if err := validator.ValidateLogisticsUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Logistics{ID: req.ID}
	updated, err := s.repo.UpdateLogistics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LogisticsResponse{ID: updated.ID}, nil
}
