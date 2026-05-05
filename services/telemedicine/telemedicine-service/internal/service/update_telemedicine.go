package service

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/dto"
	"github.com/tenadam/telemedicine-service/internal/model"
	"github.com/tenadam/telemedicine-service/internal/validator"
)

// UpdateTelemedicine validates and updates an existing telemedicine.
func (s *Service) UpdateTelemedicine(ctx context.Context, req dto.UpdateTelemedicineRequest) (*dto.TelemedicineResponse, error) {
	if err := validator.ValidateTelemedicineUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Telemedicine{ID: req.ID}
	updated, err := s.repo.UpdateTelemedicine(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TelemedicineResponse{ID: updated.ID}, nil
}
