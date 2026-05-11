package service

import (
	"context"
	"github.com/tenadam/form-service/internal/dto"
	"github.com/tenadam/form-service/internal/model"
	"github.com/tenadam/form-service/internal/validator"
)

// CreateForm validates and creates a new form.
func (s *Service) CreateForm(ctx context.Context, req dto.CreateFormRequest) (*dto.FormResponse, error) {
	if err := validator.ValidateFormCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Form{}
	created, err := s.repo.CreateForm(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FormResponse{ID: created.ID}, nil
}
