package service

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/dto"
	"github.com/tenadam/audit-analytics-service/internal/model"
	"github.com/tenadam/audit-analytics-service/internal/validator"
)

// UpdateAuditAnalytics validates and updates an existing audit-analytics.
func (s *Service) UpdateAuditAnalytics(ctx context.Context, req dto.UpdateAuditAnalyticsRequest) (*dto.AuditAnalyticsResponse, error) {
	if err := validator.ValidateAuditAnalyticsUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.AuditAnalytics{ID: req.ID}
	updated, err := s.repo.UpdateAuditAnalytics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuditAnalyticsResponse{ID: updated.ID}, nil
}
