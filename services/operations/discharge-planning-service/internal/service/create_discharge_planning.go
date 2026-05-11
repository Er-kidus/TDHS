package service

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/dto"
	"github.com/tenadam/discharge-planning-service/internal/model"
	"github.com/tenadam/discharge-planning-service/internal/validator"
)

// CreateDischargePlanning validates and creates a new discharge-planning.
func (s *Service) CreateDischargePlanning(ctx context.Context, req dto.CreateDischargePlanningRequest) (*dto.DischargePlanningResponse, error) {
	if err := validator.ValidateDischargePlanningCreate(req); err != nil {
		return nil, err
	}
	entity := &model.DischargePlanning{}
	created, err := s.repo.CreateDischargePlanning(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DischargePlanningResponse{ID: created.ID}, nil
}
