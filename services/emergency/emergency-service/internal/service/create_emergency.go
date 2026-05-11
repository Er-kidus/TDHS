package service

import (
	"context"
	"github.com/tenadam/emergency-service/internal/dto"
	"github.com/tenadam/emergency-service/internal/model"
	"github.com/tenadam/emergency-service/internal/validator"
)

// CreateEmergency validates and creates a new emergency.
func (s *Service) CreateEmergency(ctx context.Context, req dto.CreateEmergencyRequest) (*dto.EmergencyResponse, error) {
	if err := validator.ValidateEmergencyCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Emergency{}
	created, err := s.repo.CreateEmergency(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EmergencyResponse{ID: created.ID}, nil
}
