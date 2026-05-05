package service

import (
	"context"
	"github.com/tenadam/encounter-service/internal/dto"
)

// GetEncounter retrieves a single encounter by ID.
func (s *Service) GetEncounter(ctx context.Context, id string) (*dto.EncounterResponse, error) {
	entity, err := s.repo.GetEncounter(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.EncounterResponse{ID: entity.ID}, nil
}
