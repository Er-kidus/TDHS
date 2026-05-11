package service

import (
	"context"
	"github.com/tenadam/validation-service/internal/dto"
	"github.com/tenadam/validation-service/internal/model"
	"github.com/tenadam/validation-service/internal/validator"
)

// UpdateValidation validates and updates an existing validation.
func (s *Service) UpdateValidation(ctx context.Context, req dto.UpdateValidationRequest) (*dto.ValidationResponse, error) {
	if err := validator.ValidateValidationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Validation{ID: req.ID}
	updated, err := s.repo.UpdateValidation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ValidationResponse{ID: updated.ID}, nil
}
