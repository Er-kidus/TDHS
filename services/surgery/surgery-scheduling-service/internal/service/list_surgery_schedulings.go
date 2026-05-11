package service

import (
	"context"
	"github.com/tenadam/surgery-scheduling-service/internal/dto"
)

// ListSurgerySchedulings retrieves all surgery-schedulings.
func (s *Service) ListSurgerySchedulings(ctx context.Context) (*dto.ListSurgerySchedulingResponse, error) {
	entities, err := s.repo.ListSurgerySchedulings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SurgerySchedulingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SurgerySchedulingResponse{ID: e.ID})
	}
	return &dto.ListSurgerySchedulingResponse{Items: items, Total: len(items)}, nil
}
