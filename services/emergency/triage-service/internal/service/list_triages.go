package service

import (
	"context"
	"github.com/tenadam/triage-service/internal/dto"
)

// ListTriages retrieves all triages.
func (s *Service) ListTriages(ctx context.Context) (*dto.ListTriageResponse, error) {
	entities, err := s.repo.ListTriages(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TriageResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TriageResponse{ID: e.ID})
	}
	return &dto.ListTriageResponse{Items: items, Total: len(items)}, nil
}
