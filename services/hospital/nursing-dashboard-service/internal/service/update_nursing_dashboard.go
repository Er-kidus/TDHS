package service

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
	"github.com/tenadam/nursing-dashboard-service/internal/model"
	"github.com/tenadam/nursing-dashboard-service/internal/validator"
)

// UpdateNursingDashboard validates and updates an existing nursing-dashboard.
func (s *Service) UpdateNursingDashboard(ctx context.Context, req dto.UpdateNursingDashboardRequest) (*dto.NursingDashboardResponse, error) {
	if err := validator.ValidateNursingDashboardUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.NursingDashboard{ID: req.ID}
	updated, err := s.repo.UpdateNursingDashboard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingDashboardResponse{ID: updated.ID}, nil
}
