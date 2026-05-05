package service

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/dto"
	"github.com/tenadam/surveillance-service/internal/model"
	"github.com/tenadam/surveillance-service/internal/validator"
)

// UpdateSurveillance validates and updates an existing surveillance.
func (s *Service) UpdateSurveillance(ctx context.Context, req dto.UpdateSurveillanceRequest) (*dto.SurveillanceResponse, error) {
	if err := validator.ValidateSurveillanceUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Surveillance{ID: req.ID}
	updated, err := s.repo.UpdateSurveillance(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurveillanceResponse{ID: updated.ID}, nil
}
