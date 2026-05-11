package service

import (
	"context"
	"github.com/tenadam/analytics-service/internal/dto"
)

// ListAnalyticss retrieves all analyticss.
func (s *Service) ListAnalyticss(ctx context.Context) (*dto.ListAnalyticsResponse, error) {
	entities, err := s.repo.ListAnalyticss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AnalyticsResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AnalyticsResponse{ID: e.ID})
	}
	return &dto.ListAnalyticsResponse{Items: items, Total: len(items)}, nil
}
