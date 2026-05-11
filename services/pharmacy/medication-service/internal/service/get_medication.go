package service

import (
	"context"
	"github.com/tenadam/medication-service/internal/dto"
)

// GetMedication retrieves a single medication by ID.
func (s *Service) GetMedication(ctx context.Context, id string) (*dto.MedicationResponse, error) {
	entity, err := s.repo.GetMedication(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.MedicationResponse{ID: entity.ID}, nil
}
