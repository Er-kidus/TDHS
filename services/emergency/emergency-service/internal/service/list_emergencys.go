package service

import (
	"context"
	"github.com/tenadam/emergency-service/internal/dto"
)

// ListEmergencys retrieves all emergencys.
func (s *Service) ListEmergencys(ctx context.Context) (*dto.ListEmergencyResponse, error) {
	entities, err := s.repo.ListEmergencys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.EmergencyResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.EmergencyResponse{ID: e.ID})
	}
	return &dto.ListEmergencyResponse{Items: items, Total: len(items)}, nil
}
