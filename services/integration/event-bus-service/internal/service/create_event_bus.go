package service

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/dto"
	"github.com/tenadam/event-bus-service/internal/model"
	"github.com/tenadam/event-bus-service/internal/validator"
)

// CreateEventBus validates and creates a new event-bus.
func (s *Service) CreateEventBus(ctx context.Context, req dto.CreateEventBusRequest) (*dto.EventBusResponse, error) {
	if err := validator.ValidateEventBusCreate(req); err != nil {
		return nil, err
	}
	entity := &model.EventBus{}
	created, err := s.repo.CreateEventBus(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EventBusResponse{ID: created.ID}, nil
}
