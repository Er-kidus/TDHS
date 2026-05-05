package service

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/dto"
	"github.com/tenadam/scheduling-service/internal/model"
	"github.com/tenadam/scheduling-service/internal/validator"
)

// UpdateScheduling validates and updates an existing scheduling.
func (s *Service) UpdateScheduling(ctx context.Context, req dto.UpdateSchedulingRequest) (*dto.SchedulingResponse, error) {
	if err := validator.ValidateSchedulingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Scheduling{ID: req.ID}
	updated, err := s.repo.UpdateScheduling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SchedulingResponse{ID: updated.ID}, nil
}
