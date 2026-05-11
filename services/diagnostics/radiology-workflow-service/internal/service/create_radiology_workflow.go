package service

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
	"github.com/tenadam/radiology-workflow-service/internal/model"
	"github.com/tenadam/radiology-workflow-service/internal/validator"
)

// CreateRadiologyWorkflow validates and creates a new radiology-workflow.
func (s *Service) CreateRadiologyWorkflow(ctx context.Context, req dto.CreateRadiologyWorkflowRequest) (*dto.RadiologyWorkflowResponse, error) {
	if err := validator.ValidateRadiologyWorkflowCreate(req); err != nil {
		return nil, err
	}
	entity := &model.RadiologyWorkflow{}
	created, err := s.repo.CreateRadiologyWorkflow(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RadiologyWorkflowResponse{ID: created.ID}, nil
}
