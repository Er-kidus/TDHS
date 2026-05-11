package service

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/dto"
)

// ListTeleTriages retrieves all tele-triages.
func (s *Service) ListTeleTriages(ctx context.Context) (*dto.ListTeleTriageResponse, error) {
	entities, err := s.repo.ListTeleTriages(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TeleTriageResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TeleTriageResponse{ID: e.ID})
	}
	return &dto.ListTeleTriageResponse{Items: items, Total: len(items)}, nil
}
