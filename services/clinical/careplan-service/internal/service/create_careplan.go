package service

import (
	"context"
	"github.com/tenadam/careplan-service/internal/dto"
	"github.com/tenadam/careplan-service/internal/model"
	"github.com/tenadam/careplan-service/internal/validator"
)

// CreateCareplan validates and creates a new careplan.
func (s *Service) CreateCareplan(ctx context.Context, req dto.CreateCareplanRequest) (*dto.CareplanResponse, error) {
	if err := validator.ValidateCareplanCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Careplan{}
	created, err := s.repo.CreateCareplan(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.CareplanResponse{ID: created.ID}, nil
}
