package service

import (
	"context"
	"github.com/tenadam/analytics-service/internal/dto"
)

// GetAnalytics retrieves a single analytics by ID.
func (s *Service) GetAnalytics(ctx context.Context, id string) (*dto.AnalyticsResponse, error) {
	entity, err := s.repo.GetAnalytics(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AnalyticsResponse{ID: entity.ID}, nil
}
