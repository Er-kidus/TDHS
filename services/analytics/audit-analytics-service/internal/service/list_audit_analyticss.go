package service

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/dto"
)

// ListAuditAnalyticss retrieves all audit-analyticss.
func (s *Service) ListAuditAnalyticss(ctx context.Context) (*dto.ListAuditAnalyticsResponse, error) {
	entities, err := s.repo.ListAuditAnalyticss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AuditAnalyticsResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AuditAnalyticsResponse{ID: e.ID})
	}
	return &dto.ListAuditAnalyticsResponse{Items: items, Total: len(items)}, nil
}
