package service

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/dto"
	"github.com/tenadam/lab-workflow-service/internal/model"
	"github.com/tenadam/lab-workflow-service/internal/validator"
)

// UpdateLabWorkflow validates and updates an existing lab-workflow.
func (s *Service) UpdateLabWorkflow(ctx context.Context, req dto.UpdateLabWorkflowRequest) (*dto.LabWorkflowResponse, error) {
	if err := validator.ValidateLabWorkflowUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.LabWorkflow{ID: req.ID}
	updated, err := s.repo.UpdateLabWorkflow(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LabWorkflowResponse{ID: updated.ID}, nil
}
