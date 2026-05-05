package service

import (
	"context"
	"github.com/tenadam/prescription-service/internal/dto"
)

// ListPrescriptions retrieves all prescriptions.
func (s *Service) ListPrescriptions(ctx context.Context) (*dto.ListPrescriptionResponse, error) {
	entities, err := s.repo.ListPrescriptions(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PrescriptionResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PrescriptionResponse{ID: e.ID})
	}
	return &dto.ListPrescriptionResponse{Items: items, Total: len(items)}, nil
}
