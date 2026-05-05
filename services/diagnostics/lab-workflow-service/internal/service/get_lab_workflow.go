package service

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/dto"
)

// GetLabWorkflow retrieves a single lab-workflow by ID.
func (s *Service) GetLabWorkflow(ctx context.Context, id string) (*dto.LabWorkflowResponse, error) {
	entity, err := s.repo.GetLabWorkflow(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.LabWorkflowResponse{ID: entity.ID}, nil
}
