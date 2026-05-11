package service

import (
	"context"
	"github.com/tenadam/triage-service/internal/dto"
	"github.com/tenadam/triage-service/internal/model"
	"github.com/tenadam/triage-service/internal/validator"
)

// CreateTriage validates and creates a new triage.
func (s *Service) CreateTriage(ctx context.Context, req dto.CreateTriageRequest) (*dto.TriageResponse, error) {
	if err := validator.ValidateTriageCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Triage{}
	created, err := s.repo.CreateTriage(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TriageResponse{ID: created.ID}, nil
}
