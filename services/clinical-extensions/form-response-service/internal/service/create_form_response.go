package service

import (
	"context"
	"github.com/tenadam/form-response-service/internal/dto"
	"github.com/tenadam/form-response-service/internal/model"
	"github.com/tenadam/form-response-service/internal/validator"
)

// CreateFormResponse validates and creates a new form-response.
func (s *Service) CreateFormResponse(ctx context.Context, req dto.CreateFormResponseRequest) (*dto.FormResponseResponse, error) {
	if err := validator.ValidateFormResponseCreate(req); err != nil {
		return nil, err
	}
	entity := &model.FormResponse{}
	created, err := s.repo.CreateFormResponse(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FormResponseResponse{ID: created.ID}, nil
}
