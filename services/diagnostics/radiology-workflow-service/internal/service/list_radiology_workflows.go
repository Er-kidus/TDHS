package service

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
)

// ListRadiologyWorkflows retrieves all radiology-workflows.
func (s *Service) ListRadiologyWorkflows(ctx context.Context) (*dto.ListRadiologyWorkflowResponse, error) {
	entities, err := s.repo.ListRadiologyWorkflows(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.RadiologyWorkflowResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.RadiologyWorkflowResponse{ID: e.ID})
	}
	return &dto.ListRadiologyWorkflowResponse{Items: items, Total: len(items)}, nil
}
