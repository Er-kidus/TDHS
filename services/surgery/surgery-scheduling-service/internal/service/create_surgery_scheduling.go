package service

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
	"github.com/tenadam/surgery-scheduling-service/internal/model"
	"github.com/tenadam/surgery-scheduling-service/internal/validator"
)

// CreateSurgeryScheduling validates and creates a new surgery-scheduling.
func (s *Service) CreateSurgeryScheduling(ctx context.Context, req dto.CreateSurgerySchedulingRequest) (*dto.SurgerySchedulingResponse, error) {
	if err := validator.ValidateSurgerySchedulingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.SurgeryScheduling{}
	created, err := s.repo.CreateSurgeryScheduling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgerySchedulingResponse{ID: created.ID}, nil
}
