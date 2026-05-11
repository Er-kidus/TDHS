package service

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/dto"
)

// GetAuditAnalytics retrieves a single audit-analytics by ID.
func (s *Service) GetAuditAnalytics(ctx context.Context, id string) (*dto.AuditAnalyticsResponse, error) {
	entity, err := s.repo.GetAuditAnalytics(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AuditAnalyticsResponse{ID: entity.ID}, nil
}
