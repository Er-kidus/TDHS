package service

import (
	"context"
	"github.com/tenadam/patient-movement-service/internal/dto"
)

// ListPatientMovements retrieves all patient-movements.
func (s *Service) ListPatientMovements(ctx context.Context) (*dto.ListPatientMovementResponse, error) {
	entities, err := s.repo.ListPatientMovements(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PatientMovementResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PatientMovementResponse{ID: e.ID})
	}
	return &dto.ListPatientMovementResponse{Items: items, Total: len(items)}, nil
}
