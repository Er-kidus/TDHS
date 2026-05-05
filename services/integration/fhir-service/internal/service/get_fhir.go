package service

import (
	"context"
	"github.com/tenadam/fhir-service/internal/dto"
)

// GetFhir retrieves a single fhir by ID.
func (s *Service) GetFhir(ctx context.Context, id string) (*dto.FhirResponse, error) {
	entity, err := s.repo.GetFhir(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.FhirResponse{ID: entity.ID}, nil
}
