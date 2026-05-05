package service

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
	"github.com/tenadam/surgery-scheduling-service/internal/validator"
)

// UpdateSurgeryScheduling validates and updates an existing surgery-scheduling.
func (s *Service) UpdateSurgeryScheduling(ctx context.Context, req dto.UpdateSurgerySchedulingRequest) (*dto.SurgerySchedulingResponse, error) {
	if err := validator.ValidateSurgerySchedulingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.SurgeryScheduling{ID: req.ID}
	updated, err := s.repo.UpdateSurgeryScheduling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgerySchedulingResponse{ID: updated.ID}, nil
}
