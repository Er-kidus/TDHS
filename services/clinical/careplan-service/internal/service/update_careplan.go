package service

import (
	"context"
	"github.com/tenadam/careplan-service/internal/dto"
	"github.com/tenadam/careplan-service/internal/model"
	"github.com/tenadam/careplan-service/internal/validator"
)

// UpdateCareplan validates and updates an existing careplan.
func (s *Service) UpdateCareplan(ctx context.Context, req dto.UpdateCareplanRequest) (*dto.CareplanResponse, error) {
	if err := validator.ValidateCareplanUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Careplan{ID: req.ID}
	updated, err := s.repo.UpdateCareplan(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.CareplanResponse{ID: updated.ID}, nil
}
