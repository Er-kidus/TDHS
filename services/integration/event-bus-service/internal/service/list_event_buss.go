package service

import (
	"context"
	"github.com/tenadam/event-bus-service/internal/dto"
)

// ListEventBuss retrieves all event-buss.
func (s *Service) ListEventBuss(ctx context.Context) (*dto.ListEventBusResponse, error) {
	entities, err := s.repo.ListEventBuss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.EventBusResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.EventBusResponse{ID: e.ID})
	}
	return &dto.ListEventBusResponse{Items: items, Total: len(items)}, nil
}
