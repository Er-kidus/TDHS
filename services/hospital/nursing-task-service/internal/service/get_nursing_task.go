package service

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/dto"
)

// GetNursingTask retrieves a single nursing-task by ID.
func (s *Service) GetNursingTask(ctx context.Context, id string) (*dto.NursingTaskResponse, error) {
	entity, err := s.repo.GetNursingTask(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.NursingTaskResponse{ID: entity.ID}, nil
}
