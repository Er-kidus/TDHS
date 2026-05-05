package service

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/dto"
	"github.com/tenadam/lab-workflow-service/internal/model"
	"github.com/tenadam/lab-workflow-service/internal/validator"
)

// CreateLabWorkflow validates and creates a new lab-workflow.
func (s *Service) CreateLabWorkflow(ctx context.Context, req dto.CreateLabWorkflowRequest) (*dto.LabWorkflowResponse, error) {
	if err := validator.ValidateLabWorkflowCreate(req); err != nil {
		return nil, err
	}
	entity := &model.LabWorkflow{}
	created, err := s.repo.CreateLabWorkflow(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LabWorkflowResponse{ID: created.ID}, nil
}
