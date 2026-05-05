package service

import (
	"context"
	"github.com/tenadam/analytics-service/internal/dto"
	"github.com/tenadam/analytics-service/internal/model"
	"github.com/tenadam/analytics-service/internal/validator"
)

// CreateAnalytics validates and creates a new analytics.
func (s *Service) CreateAnalytics(ctx context.Context, req dto.CreateAnalyticsRequest) (*dto.AnalyticsResponse, error) {
	if err := validator.ValidateAnalyticsCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Analytics{}
	created, err := s.repo.CreateAnalytics(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AnalyticsResponse{ID: created.ID}, nil
}
