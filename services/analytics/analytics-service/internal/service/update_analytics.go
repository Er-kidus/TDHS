package service

import (
	"context"
	"github.com/tenadam/analytics-service/internal/dto"
	"github.com/tenadam/analytics-service/internal/model"
	"github.com/tenadam/analytics-service/internal/validator"
)

// UpdateAnalytics validates and updates an existing analytics.
func (s *Service) UpdateAnalytics(ctx context.Context, req dto.UpdateAnalyticsRequest) (*dto.AnalyticsResponse, error) {
	if err := validator.ValidateAnalyticsUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Analytics{ID: req.ID}
	updated, err := s.repo.UpdateAnalytics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AnalyticsResponse{ID: updated.ID}, nil
}
