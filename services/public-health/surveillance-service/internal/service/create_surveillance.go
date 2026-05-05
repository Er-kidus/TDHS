package service

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/dto"
	"github.com/tenadam/surveillance-service/internal/model"
	"github.com/tenadam/surveillance-service/internal/validator"
)

// CreateSurveillance validates and creates a new surveillance.
func (s *Service) CreateSurveillance(ctx context.Context, req dto.CreateSurveillanceRequest) (*dto.SurveillanceResponse, error) {
	if err := validator.ValidateSurveillanceCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Surveillance{}
	created, err := s.repo.CreateSurveillance(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurveillanceResponse{ID: created.ID}, nil
}
