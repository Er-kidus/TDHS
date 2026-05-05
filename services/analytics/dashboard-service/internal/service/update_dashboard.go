package service

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/dto"
	"github.com/tenadam/dashboard-service/internal/model"
	"github.com/tenadam/dashboard-service/internal/validator"
)

// UpdateDashboard validates and updates an existing dashboard.
func (s *Service) UpdateDashboard(ctx context.Context, req dto.UpdateDashboardRequest) (*dto.DashboardResponse, error) {
	if err := validator.ValidateDashboardUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Dashboard{ID: req.ID}
	updated, err := s.repo.UpdateDashboard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DashboardResponse{ID: updated.ID}, nil
}
