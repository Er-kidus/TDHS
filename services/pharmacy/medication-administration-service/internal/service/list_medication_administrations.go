package service

import (
	"context"
	"github.com/tenadam/medication-administration-service/internal/dto"
)

// ListMedicationAdministrations retrieves all medication-administrations.
func (s *Service) ListMedicationAdministrations(ctx context.Context) (*dto.ListMedicationAdministrationResponse, error) {
	entities, err := s.repo.ListMedicationAdministrations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.MedicationAdministrationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.MedicationAdministrationResponse{ID: e.ID})
	}
	return &dto.ListMedicationAdministrationResponse{Items: items, Total: len(items)}, nil
}
