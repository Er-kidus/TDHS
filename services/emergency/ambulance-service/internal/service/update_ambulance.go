package service

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/dto"
	"github.com/tenadam/ambulance-service/internal/model"
	"github.com/tenadam/ambulance-service/internal/validator"
)

// UpdateAmbulance validates and updates an existing ambulance.
func (s *Service) UpdateAmbulance(ctx context.Context, req dto.UpdateAmbulanceRequest) (*dto.AmbulanceResponse, error) {
	if err := validator.ValidateAmbulanceUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Ambulance{ID: req.ID}
	updated, err := s.repo.UpdateAmbulance(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AmbulanceResponse{ID: updated.ID}, nil
}
