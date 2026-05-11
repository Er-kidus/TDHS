package service

import (
	"context"
	"github.com/tenadam/encounter-service/internal/dto"
)

// ListEncounters retrieves all encounters.
func (s *Service) ListEncounters(ctx context.Context) (*dto.ListEncounterResponse, error) {
	entities, err := s.repo.ListEncounters(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.EncounterResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.EncounterResponse{ID: e.ID})
	}
	return &dto.ListEncounterResponse{Items: items, Total: len(items)}, nil
}
