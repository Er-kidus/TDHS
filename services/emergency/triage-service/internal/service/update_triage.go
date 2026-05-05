package service

import (
	"context"
	"github.com/tenadam/triage-service/internal/dto"
	"github.com/tenadam/triage-service/internal/model"
	"github.com/tenadam/triage-service/internal/validator"
)

// UpdateTriage validates and updates an existing triage.
func (s *Service) UpdateTriage(ctx context.Context, req dto.UpdateTriageRequest) (*dto.TriageResponse, error) {
	if err := validator.ValidateTriageUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Triage{ID: req.ID}
	updated, err := s.repo.UpdateTriage(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TriageResponse{ID: updated.ID}, nil
}
