package service

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
)

// ListNursingDashboards retrieves all nursing-dashboards.
func (s *Service) ListNursingDashboards(ctx context.Context) (*dto.ListNursingDashboardResponse, error) {
	entities, err := s.repo.ListNursingDashboards(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.NursingDashboardResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.NursingDashboardResponse{ID: e.ID})
	}
	return &dto.ListNursingDashboardResponse{Items: items, Total: len(items)}, nil
}
