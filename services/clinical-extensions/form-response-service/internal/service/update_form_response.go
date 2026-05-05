package service

import (
	"context"
	"github.com/tenadam/form-response-service/internal/dto"
	"github.com/tenadam/form-response-service/internal/model"
	"github.com/tenadam/form-response-service/internal/validator"
)

// UpdateFormResponse validates and updates an existing form-response.
func (s *Service) UpdateFormResponse(ctx context.Context, req dto.UpdateFormResponseRequest) (*dto.FormResponseResponse, error) {
	if err := validator.ValidateFormResponseUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.FormResponse{ID: req.ID}
	updated, err := s.repo.UpdateFormResponse(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FormResponseResponse{ID: updated.ID}, nil
}
