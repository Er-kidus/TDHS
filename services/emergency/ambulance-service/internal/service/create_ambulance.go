package service

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/dto"
	"github.com/tenadam/ambulance-service/internal/model"
	"github.com/tenadam/ambulance-service/internal/validator"
)

// CreateAmbulance validates and creates a new ambulance.
func (s *Service) CreateAmbulance(ctx context.Context, req dto.CreateAmbulanceRequest) (*dto.AmbulanceResponse, error) {
	if err := validator.ValidateAmbulanceCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Ambulance{}
	created, err := s.repo.CreateAmbulance(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AmbulanceResponse{ID: created.ID}, nil
}
