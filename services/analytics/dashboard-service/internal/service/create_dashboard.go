package service

import (
	"context"
	"github.com/tenadam/dashboard-service/internal/dto"
	"github.com/tenadam/dashboard-service/internal/model"
	"github.com/tenadam/dashboard-service/internal/validator"
)

// CreateDashboard validates and creates a new dashboard.
func (s *Service) CreateDashboard(ctx context.Context, req dto.CreateDashboardRequest) (*dto.DashboardResponse, error) {
	if err := validator.ValidateDashboardCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Dashboard{}
	created, err := s.repo.CreateDashboard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DashboardResponse{ID: created.ID}, nil
}
