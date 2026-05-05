package service

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/dto"
	"github.com/tenadam/integration-job-service/internal/model"
	"github.com/tenadam/integration-job-service/internal/validator"
)

// CreateIntegrationJob validates and creates a new integration-job.
func (s *Service) CreateIntegrationJob(ctx context.Context, req dto.CreateIntegrationJobRequest) (*dto.IntegrationJobResponse, error) {
	if err := validator.ValidateIntegrationJobCreate(req); err != nil {
		return nil, err
	}
	entity := &model.IntegrationJob{}
	created, err := s.repo.CreateIntegrationJob(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IntegrationJobResponse{ID: created.ID}, nil
}
