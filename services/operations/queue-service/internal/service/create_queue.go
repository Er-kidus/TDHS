package service

import (
	"context"
	"github.com/tenadam/queue-service/internal/dto"
	"github.com/tenadam/queue-service/internal/model"
	"github.com/tenadam/queue-service/internal/validator"
)

// CreateQueue validates and creates a new queue.
func (s *Service) CreateQueue(ctx context.Context, req dto.CreateQueueRequest) (*dto.QueueResponse, error) {
	if err := validator.ValidateQueueCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Queue{}
	created, err := s.repo.CreateQueue(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.QueueResponse{ID: created.ID}, nil
}
