package service

import (
	"context"
	"github.com/tenadam/fhir-service/internal/dto"
)

// ListFhirs retrieves all fhirs.
func (s *Service) ListFhirs(ctx context.Context) (*dto.ListFhirResponse, error) {
	entities, err := s.repo.ListFhirs(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.FhirResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.FhirResponse{ID: e.ID})
	}
	return &dto.ListFhirResponse{Items: items, Total: len(items)}, nil
}
