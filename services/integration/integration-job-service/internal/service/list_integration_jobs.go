package service

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/dto"
)

// ListIntegrationJobs retrieves all integration-jobs.
func (s *Service) ListIntegrationJobs(ctx context.Context) (*dto.ListIntegrationJobResponse, error) {
	entities, err := s.repo.ListIntegrationJobs(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.IntegrationJobResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.IntegrationJobResponse{ID: e.ID})
	}
	return &dto.ListIntegrationJobResponse{Items: items, Total: len(items)}, nil
}
