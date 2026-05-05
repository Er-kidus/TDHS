package service

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/dto"
)

// ListSchedulings retrieves all schedulings.
func (s *Service) ListSchedulings(ctx context.Context) (*dto.ListSchedulingResponse, error) {
	entities, err := s.repo.ListSchedulings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SchedulingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SchedulingResponse{ID: e.ID})
	}
	return &dto.ListSchedulingResponse{Items: items, Total: len(items)}, nil
}
