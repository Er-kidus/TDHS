package service

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/dto"
)

// GetMedicationAdministration retrieves a single medication-administration by ID.
func (s *Service) GetMedicationAdministration(ctx context.Context, id string) (*dto.MedicationAdministrationResponse, error) {
	entity, err := s.repo.GetMedicationAdministration(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.MedicationAdministrationResponse{ID: entity.ID}, nil
}
