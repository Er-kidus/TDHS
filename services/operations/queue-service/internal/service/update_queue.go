package service

import (
	"context"
	"github.com/tenadam/queue-service/internal/dto"
	"github.com/tenadam/queue-service/internal/model"
	"github.com/tenadam/queue-service/internal/validator"
)

// UpdateQueue validates and updates an existing queue.
func (s *Service) UpdateQueue(ctx context.Context, req dto.UpdateQueueRequest) (*dto.QueueResponse, error) {
	if err := validator.ValidateQueueUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Queue{ID: req.ID}
	updated, err := s.repo.UpdateQueue(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.QueueResponse{ID: updated.ID}, nil
}
