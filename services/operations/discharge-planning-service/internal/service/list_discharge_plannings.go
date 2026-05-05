package service

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/dto"
)

// ListDischargePlannings retrieves all discharge-plannings.
func (s *Service) ListDischargePlannings(ctx context.Context) (*dto.ListDischargePlanningResponse, error) {
	entities, err := s.repo.ListDischargePlannings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DischargePlanningResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DischargePlanningResponse{ID: e.ID})
	}
	return &dto.ListDischargePlanningResponse{Items: items, Total: len(items)}, nil
}
