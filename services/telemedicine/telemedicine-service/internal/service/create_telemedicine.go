package service

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/dto"
	"github.com/tenadam/telemedicine-service/internal/model"
	"github.com/tenadam/telemedicine-service/internal/validator"
)

// CreateTelemedicine validates and creates a new telemedicine.
func (s *Service) CreateTelemedicine(ctx context.Context, req dto.CreateTelemedicineRequest) (*dto.TelemedicineResponse, error) {
	if err := validator.ValidateTelemedicineCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Telemedicine{}
	created, err := s.repo.CreateTelemedicine(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TelemedicineResponse{ID: created.ID}, nil
}
