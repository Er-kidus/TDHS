package service

import (
	"context"
	"github.com/tenadam/validation-service/internal/dto"
	"github.com/tenadam/validation-service/internal/model"
	"github.com/tenadam/validation-service/internal/validator"
)

// CreateValidation validates and creates a new validation.
func (s *Service) CreateValidation(ctx context.Context, req dto.CreateValidationRequest) (*dto.ValidationResponse, error) {
	if err := validator.ValidateValidationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Validation{}
	created, err := s.repo.CreateValidation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ValidationResponse{ID: created.ID}, nil
}
