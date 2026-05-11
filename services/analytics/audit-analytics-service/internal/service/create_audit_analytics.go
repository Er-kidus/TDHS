package service

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/dto"
	"github.com/tenadam/audit-analytics-service/internal/model"
	"github.com/tenadam/audit-analytics-service/internal/validator"
)

// CreateAuditAnalytics validates and creates a new audit-analytics.
func (s *Service) CreateAuditAnalytics(ctx context.Context, req dto.CreateAuditAnalyticsRequest) (*dto.AuditAnalyticsResponse, error) {
	if err := validator.ValidateAuditAnalyticsCreate(req); err != nil {
		return nil, err
	}
	entity := &model.AuditAnalytics{}
	created, err := s.repo.CreateAuditAnalytics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuditAnalyticsResponse{ID: created.ID}, nil
}
