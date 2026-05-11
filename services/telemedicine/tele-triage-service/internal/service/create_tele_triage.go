package service

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/dto"
	"github.com/tenadam/tele-triage-service/internal/model"
	"github.com/tenadam/tele-triage-service/internal/validator"
)

// CreateTeleTriage validates and creates a new tele-triage.
func (s *Service) CreateTeleTriage(ctx context.Context, req dto.CreateTeleTriageRequest) (*dto.TeleTriageResponse, error) {
	if err := validator.ValidateTeleTriageCreate(req); err != nil {
		return nil, err
	}
	entity := &model.TeleTriage{}
	created, err := s.repo.CreateTeleTriage(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TeleTriageResponse{ID: created.ID}, nil
}
