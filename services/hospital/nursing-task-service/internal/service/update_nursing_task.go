package service

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/dto"
	"github.com/tenadam/nursing-task-service/internal/model"
	"github.com/tenadam/nursing-task-service/internal/validator"
)

// UpdateNursingTask validates and updates an existing nursing-task.
func (s *Service) UpdateNursingTask(ctx context.Context, req dto.UpdateNursingTaskRequest) (*dto.NursingTaskResponse, error) {
	if err := validator.ValidateNursingTaskUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.NursingTask{ID: req.ID}
	updated, err := s.repo.UpdateNursingTask(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingTaskResponse{ID: updated.ID}, nil
}
