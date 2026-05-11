package service

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/dto"
)

// GetPatientMovement retrieves a single patient-movement by ID.
func (s *Service) GetPatientMovement(ctx context.Context, id string) (*dto.PatientMovementResponse, error) {
	entity, err := s.repo.GetPatientMovement(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PatientMovementResponse{ID: entity.ID}, nil
}
