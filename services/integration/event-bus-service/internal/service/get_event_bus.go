package service

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/dto"
)

// GetEventBus retrieves a single event-bus by ID.
func (s *Service) GetEventBus(ctx context.Context, id string) (*dto.EventBusResponse, error) {
	entity, err := s.repo.GetEventBus(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.EventBusResponse{ID: entity.ID}, nil
}
