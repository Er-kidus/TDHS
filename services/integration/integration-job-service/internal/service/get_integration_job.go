package service

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/dto"
)

// GetIntegrationJob retrieves a single integration-job by ID.
func (s *Service) GetIntegrationJob(ctx context.Context, id string) (*dto.IntegrationJobResponse, error) {
	entity, err := s.repo.GetIntegrationJob(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.IntegrationJobResponse{ID: entity.ID}, nil
}
