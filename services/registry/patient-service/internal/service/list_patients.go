package service

import (
	"context"
	"github.com/tenadam/patient-service/internal/dto"
)

// ListPatients retrieves all patients.
func (s *Service) ListPatients(ctx context.Context) (*dto.ListPatientResponse, error) {
	entities, err := s.repo.ListPatients(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PatientResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PatientResponse{ID: e.ID})
	}
	return &dto.ListPatientResponse{Items: items, Total: len(items)}, nil
}
