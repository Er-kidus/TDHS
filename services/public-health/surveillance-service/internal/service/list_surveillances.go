package service

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/dto"
)

// ListSurveillances retrieves all surveillances.
func (s *Service) ListSurveillances(ctx context.Context) (*dto.ListSurveillanceResponse, error) {
	entities, err := s.repo.ListSurveillances(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SurveillanceResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SurveillanceResponse{ID: e.ID})
	}
	return &dto.ListSurveillanceResponse{Items: items, Total: len(items)}, nil
}
