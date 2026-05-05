package service

import (
	"context"
	"github.com/tenadam/patient-service/internal/dto"
)

// GetPatient retrieves a single patient by ID.
func (s *Service) GetPatient(ctx context.Context, id string) (*dto.PatientResponse, error) {
	entity, err := s.repo.GetPatient(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PatientResponse{ID: entity.ID}, nil
}
