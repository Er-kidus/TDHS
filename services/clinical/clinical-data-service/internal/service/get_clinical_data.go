package service

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/dto"
)

// GetClinicalData retrieves a single clinical-data by ID.
func (s *Service) GetClinicalData(ctx context.Context, id string) (*dto.ClinicalDataResponse, error) {
	entity, err := s.repo.GetClinicalData(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ClinicalDataResponse{ID: entity.ID}, nil
}
