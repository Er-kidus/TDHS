package service

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/dto"
)

// ListNursingTasks retrieves all nursing-tasks.
func (s *Service) ListNursingTasks(ctx context.Context) (*dto.ListNursingTaskResponse, error) {
	entities, err := s.repo.ListNursingTasks(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.NursingTaskResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.NursingTaskResponse{ID: e.ID})
	}
	return &dto.ListNursingTaskResponse{Items: items, Total: len(items)}, nil
}
