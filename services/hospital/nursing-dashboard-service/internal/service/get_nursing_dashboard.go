package service

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
)

// GetNursingDashboard retrieves a single nursing-dashboard by ID.
func (s *Service) GetNursingDashboard(ctx context.Context, id string) (*dto.NursingDashboardResponse, error) {
	entity, err := s.repo.GetNursingDashboard(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.NursingDashboardResponse{ID: entity.ID}, nil
}
