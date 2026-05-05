package service

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/dto"
	"github.com/tenadam/discharge-planning-service/internal/model"
	"github.com/tenadam/discharge-planning-service/internal/validator"
)

// UpdateDischargePlanning validates and updates an existing discharge-planning.
func (s *Service) UpdateDischargePlanning(ctx context.Context, req dto.UpdateDischargePlanningRequest) (*dto.DischargePlanningResponse, error) {
	if err := validator.ValidateDischargePlanningUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.DischargePlanning{ID: req.ID}
	updated, err := s.repo.UpdateDischargePlanning(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DischargePlanningResponse{ID: updated.ID}, nil
}
