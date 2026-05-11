package service

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/dto"
	"github.com/tenadam/patient-movement-service/internal/model"
	"github.com/tenadam/patient-movement-service/internal/validator"
)

// UpdatePatientMovement validates and updates an existing patient-movement.
func (s *Service) UpdatePatientMovement(ctx context.Context, req dto.UpdatePatientMovementRequest) (*dto.PatientMovementResponse, error) {
	if err := validator.ValidatePatientMovementUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.PatientMovement{ID: req.ID}
	updated, err := s.repo.UpdatePatientMovement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PatientMovementResponse{ID: updated.ID}, nil
}
