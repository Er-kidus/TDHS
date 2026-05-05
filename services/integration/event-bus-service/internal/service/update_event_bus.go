package service

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/dto"
	"github.com/tenadam/event-bus-service/internal/model"
	"github.com/tenadam/event-bus-service/internal/validator"
)

// UpdateEventBus validates and updates an existing event-bus.
func (s *Service) UpdateEventBus(ctx context.Context, req dto.UpdateEventBusRequest) (*dto.EventBusResponse, error) {
	if err := validator.ValidateEventBusUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.EventBus{ID: req.ID}
	updated, err := s.repo.UpdateEventBus(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EventBusResponse{ID: updated.ID}, nil
}
