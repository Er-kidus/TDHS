package service

import (
	"context"
	"github.com/tenadam/queue-service/internal/dto"
)

// ListQueues retrieves all queues.
func (s *Service) ListQueues(ctx context.Context) (*dto.ListQueueResponse, error) {
	entities, err := s.repo.ListQueues(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.QueueResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.QueueResponse{ID: e.ID})
	}
	return &dto.ListQueueResponse{Items: items, Total: len(items)}, nil
}
