package service

import (
	"context"
	"github.com/tenadam/emergency-service/internal/dto"
	"github.com/tenadam/emergency-service/internal/model"
	"github.com/tenadam/emergency-service/internal/validator"
)

// UpdateEmergency validates and updates an existing emergency.
func (s *Service) UpdateEmergency(ctx context.Context, req dto.UpdateEmergencyRequest) (*dto.EmergencyResponse, error) {
	if err := validator.ValidateEmergencyUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Emergency{ID: req.ID}
	updated, err := s.repo.UpdateEmergency(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EmergencyResponse{ID: updated.ID}, nil
}
