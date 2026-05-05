package service

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/dto"
	"github.com/tenadam/scheduling-service/internal/model"
	"github.com/tenadam/scheduling-service/internal/validator"
)

// CreateScheduling validates and creates a new scheduling.
func (s *Service) CreateScheduling(ctx context.Context, req dto.CreateSchedulingRequest) (*dto.SchedulingResponse, error) {
	if err := validator.ValidateSchedulingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Scheduling{}
	created, err := s.repo.CreateScheduling(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SchedulingResponse{ID: created.ID}, nil
}
