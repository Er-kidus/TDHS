package service

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/dto"
	"github.com/tenadam/radiology-workflow-service/internal/model"
	"github.com/tenadam/radiology-workflow-service/internal/validator"
)

// UpdateRadiologyWorkflow validates and updates an existing radiology-workflow.
func (s *Service) UpdateRadiologyWorkflow(ctx context.Context, req dto.UpdateRadiologyWorkflowRequest) (*dto.RadiologyWorkflowResponse, error) {
	if err := validator.ValidateRadiologyWorkflowUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.RadiologyWorkflow{ID: req.ID}
	updated, err := s.repo.UpdateRadiologyWorkflow(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RadiologyWorkflowResponse{ID: updated.ID}, nil
}
