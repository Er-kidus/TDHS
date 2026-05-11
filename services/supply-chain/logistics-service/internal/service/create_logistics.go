package service

import (
	"context"
	"github.com/tenadam/logistics-service/internal/dto"
	"github.com/tenadam/logistics-service/internal/model"
	"github.com/tenadam/logistics-service/internal/validator"
)

// CreateLogistics validates and creates a new logistics.
func (s *Service) CreateLogistics(ctx context.Context, req dto.CreateLogisticsRequest) (*dto.LogisticsResponse, error) {
	if err := validator.ValidateLogisticsCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Logistics{}
	created, err := s.repo.CreateLogistics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LogisticsResponse{ID: created.ID}, nil
}
