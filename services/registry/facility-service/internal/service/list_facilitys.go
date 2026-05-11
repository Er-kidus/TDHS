package service

import (
	"context"
	"github.com/tenadam/facility-service/internal/dto"
)

// ListFacilitys retrieves all facilitys.
func (s *Service) ListFacilitys(ctx context.Context) (*dto.ListFacilityResponse, error) {
	entities, err := s.repo.ListFacilitys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.FacilityResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.FacilityResponse{ID: e.ID})
	}
	return &dto.ListFacilityResponse{Items: items, Total: len(items)}, nil
}
