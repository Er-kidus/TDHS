package service

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
)

// GetRadiologyWorkflow retrieves a single radiology-workflow by ID.
func (s *Service) GetRadiologyWorkflow(ctx context.Context, id string) (*dto.RadiologyWorkflowResponse, error) {
	entity, err := s.repo.GetRadiologyWorkflow(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.RadiologyWorkflowResponse{ID: entity.ID}, nil
}
