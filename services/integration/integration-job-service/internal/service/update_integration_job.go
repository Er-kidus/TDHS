package service

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/dto"
	"github.com/tenadam/integration-job-service/internal/model"
	"github.com/tenadam/integration-job-service/internal/validator"
)

// UpdateIntegrationJob validates and updates an existing integration-job.
func (s *Service) UpdateIntegrationJob(ctx context.Context, req dto.UpdateIntegrationJobRequest) (*dto.IntegrationJobResponse, error) {
	if err := validator.ValidateIntegrationJobUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.IntegrationJob{ID: req.ID}
	updated, err := s.repo.UpdateIntegrationJob(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IntegrationJobResponse{ID: updated.ID}, nil
}
