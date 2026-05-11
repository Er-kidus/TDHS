package service

import (
	"context"
	"github.com/tenadam/form-service/internal/dto"
	"github.com/tenadam/form-service/internal/model"
	"github.com/tenadam/form-service/internal/validator"
)

// UpdateForm validates and updates an existing form.
func (s *Service) UpdateForm(ctx context.Context, req dto.UpdateFormRequest) (*dto.FormResponse, error) {
	if err := validator.ValidateFormUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Form{ID: req.ID}
	updated, err := s.repo.UpdateForm(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FormResponse{ID: updated.ID}, nil
}
