package service

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/dto"
)

// GetDashboard retrieves a single dashboard by ID.
func (s *Service) GetDashboard(ctx context.Context, id string) (*dto.DashboardResponse, error) {
	entity, err := s.repo.GetDashboard(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DashboardResponse{ID: entity.ID}, nil
}
