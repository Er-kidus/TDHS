package service

import (
	"context"
	"github.com/tenadam/medication-service/internal/dto"
)

// ListMedications retrieves all medications.
func (s *Service) ListMedications(ctx context.Context) (*dto.ListMedicationResponse, error) {
	entities, err := s.repo.ListMedications(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.MedicationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.MedicationResponse{ID: e.ID})
	}
	return &dto.ListMedicationResponse{Items: items, Total: len(items)}, nil
}
