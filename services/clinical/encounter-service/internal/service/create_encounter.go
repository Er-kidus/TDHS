package service

import (
	"context"
	"github.com/tenadam/encounter-service/internal/dto"
	"github.com/tenadam/encounter-service/internal/model"
	"github.com/tenadam/encounter-service/internal/validator"
)

// CreateEncounter validates and creates a new encounter.
func (s *Service) CreateEncounter(ctx context.Context, req dto.CreateEncounterRequest) (*dto.EncounterResponse, error) {
	if err := validator.ValidateEncounterCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Encounter{}
	created, err := s.repo.CreateEncounter(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EncounterResponse{ID: created.ID}, nil
}
