package service

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/dto"
)

// ListInteroperabilitys retrieves all interoperabilitys.
func (s *Service) ListInteroperabilitys(ctx context.Context) (*dto.ListInteroperabilityResponse, error) {
	entities, err := s.repo.ListInteroperabilitys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.InteroperabilityResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.InteroperabilityResponse{ID: e.ID})
	}
	return &dto.ListInteroperabilityResponse{Items: items, Total: len(items)}, nil
}
