package service

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/dto"
)

// ListAmbulances retrieves all ambulances.
func (s *Service) ListAmbulances(ctx context.Context) (*dto.ListAmbulanceResponse, error) {
	entities, err := s.repo.ListAmbulances(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AmbulanceResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AmbulanceResponse{ID: e.ID})
	}
	return &dto.ListAmbulanceResponse{Items: items, Total: len(items)}, nil
}
