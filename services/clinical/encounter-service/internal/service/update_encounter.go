package service

import (
	"context"
	"github.com/tenadam/encounter-service/internal/dto"
	"github.com/tenadam/encounter-service/internal/model"
	"github.com/tenadam/encounter-service/internal/validator"
)

// UpdateEncounter validates and updates an existing encounter.
func (s *Service) UpdateEncounter(ctx context.Context, req dto.UpdateEncounterRequest) (*dto.EncounterResponse, error) {
	if err := validator.ValidateEncounterUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Encounter{ID: req.ID}
	updated, err := s.repo.UpdateEncounter(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EncounterResponse{ID: updated.ID}, nil
}
