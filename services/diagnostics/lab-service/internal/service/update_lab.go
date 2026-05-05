package service

import (
	"context"
	"github.com/tenadam/lab-service/internal/dto"
	"github.com/tenadam/lab-service/internal/model"
	"github.com/tenadam/lab-service/internal/validator"
)

// UpdateLab validates and updates an existing lab.
func (s *Service) UpdateLab(ctx context.Context, req dto.UpdateLabRequest) (*dto.LabResponse, error) {
	if err := validator.ValidateLabUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Lab{ID: req.ID}
	updated, err := s.repo.UpdateLab(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LabResponse{ID: updated.ID}, nil
}
