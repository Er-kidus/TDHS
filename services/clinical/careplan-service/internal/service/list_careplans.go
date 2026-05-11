package service

import (
	"context"
	"github.com/tenadam/careplan-service/internal/dto"
)

// ListCareplans retrieves all careplans.
func (s *Service) ListCareplans(ctx context.Context) (*dto.ListCareplanResponse, error) {
	entities, err := s.repo.ListCareplans(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.CareplanResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.CareplanResponse{ID: e.ID})
	}
	return &dto.ListCareplanResponse{Items: items, Total: len(items)}, nil
}
