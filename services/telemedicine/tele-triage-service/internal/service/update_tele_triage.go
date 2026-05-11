package service

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/dto"
	"github.com/tenadam/tele-triage-service/internal/model"
	"github.com/tenadam/tele-triage-service/internal/validator"
)

// UpdateTeleTriage validates and updates an existing tele-triage.
func (s *Service) UpdateTeleTriage(ctx context.Context, req dto.UpdateTeleTriageRequest) (*dto.TeleTriageResponse, error) {
	if err := validator.ValidateTeleTriageUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.TeleTriage{ID: req.ID}
	updated, err := s.repo.UpdateTeleTriage(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TeleTriageResponse{ID: updated.ID}, nil
}
