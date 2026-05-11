package service

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/dto"
	"github.com/tenadam/nursing-task-service/internal/model"
	"github.com/tenadam/nursing-task-service/internal/validator"
)

// CreateNursingTask validates and creates a new nursing-task.
func (s *Service) CreateNursingTask(ctx context.Context, req dto.CreateNursingTaskRequest) (*dto.NursingTaskResponse, error) {
	if err := validator.ValidateNursingTaskCreate(req); err != nil {
		return nil, err
	}
	entity := &model.NursingTask{}
	created, err := s.repo.CreateNursingTask(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingTaskResponse{ID: created.ID}, nil
}
