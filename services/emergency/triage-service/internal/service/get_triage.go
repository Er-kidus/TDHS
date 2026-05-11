package service

import (
	"context"
	"github.com/tenadam/triage-service/internal/dto"
)

// GetTriage retrieves a single triage by ID.
func (s *Service) GetTriage(ctx context.Context, id string) (*dto.TriageResponse, error) {
	entity, err := s.repo.GetTriage(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.TriageResponse{ID: entity.ID}, nil
}
