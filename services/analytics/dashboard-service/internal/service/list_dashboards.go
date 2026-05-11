package service

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/dto"
)

// ListDashboards retrieves all dashboards.
func (s *Service) ListDashboards(ctx context.Context) (*dto.ListDashboardResponse, error) {
	entities, err := s.repo.ListDashboards(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DashboardResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DashboardResponse{ID: e.ID})
	}
	return &dto.ListDashboardResponse{Items: items, Total: len(items)}, nil
}
