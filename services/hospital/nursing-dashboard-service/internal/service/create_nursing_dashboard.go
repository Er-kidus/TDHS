package service

import (
	"context"
	"github.com/tenadam/nursing-dashboard-service/internal/dto"
	"github.com/tenadam/nursing-dashboard-service/internal/model"
	"github.com/tenadam/nursing-dashboard-service/internal/validator"
)

// CreateNursingDashboard validates and creates a new nursing-dashboard.
func (s *Service) CreateNursingDashboard(ctx context.Context, req dto.CreateNursingDashboardRequest) (*dto.NursingDashboardResponse, error) {
	if err := validator.ValidateNursingDashboardCreate(req); err != nil {
		return nil, err
	}
	entity := &model.NursingDashboard{}
	created, err := s.repo.CreateNursingDashboard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingDashboardResponse{ID: created.ID}, nil
}
