package service

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/dto"
)

// ListLabWorkflows retrieves all lab-workflows.
func (s *Service) ListLabWorkflows(ctx context.Context) (*dto.ListLabWorkflowResponse, error) {
	entities, err := s.repo.ListLabWorkflows(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.LabWorkflowResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.LabWorkflowResponse{ID: e.ID})
	}
	return &dto.ListLabWorkflowResponse{Items: items, Total: len(items)}, nil
}
