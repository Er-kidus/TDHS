package service

import (
	"context"
	"github.com/tenadam/prescription-service/internal/dto"
)

// GetPrescription retrieves a single prescription by ID.
func (s *Service) GetPrescription(ctx context.Context, id string) (*dto.PrescriptionResponse, error) {
	entity, err := s.repo.GetPrescription(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PrescriptionResponse{ID: entity.ID}, nil
}
