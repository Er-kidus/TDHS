package service

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/dto"
	"github.com/tenadam/patient-movement-service/internal/model"
	"github.com/tenadam/patient-movement-service/internal/validator"
)

// CreatePatientMovement validates and creates a new patient-movement.
func (s *Service) CreatePatientMovement(ctx context.Context, req dto.CreatePatientMovementRequest) (*dto.PatientMovementResponse, error) {
	if err := validator.ValidatePatientMovementCreate(req); err != nil {
		return nil, err
	}
	entity := &model.PatientMovement{}
	created, err := s.repo.CreatePatientMovement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PatientMovementResponse{ID: created.ID}, nil
}
