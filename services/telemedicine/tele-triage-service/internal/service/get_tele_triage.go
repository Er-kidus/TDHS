package service

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/dto"
)

// GetTeleTriage retrieves a single tele-triage by ID.
func (s *Service) GetTeleTriage(ctx context.Context, id string) (*dto.TeleTriageResponse, error) {
	entity, err := s.repo.GetTeleTriage(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TeleTriageResponse{ID: entity.ID}, nil
}
