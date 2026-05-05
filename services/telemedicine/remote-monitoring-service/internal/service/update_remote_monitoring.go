package service

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
	"github.com/tenadam/remote-monitoring-service/internal/model"
	"github.com/tenadam/remote-monitoring-service/internal/validator"
)

// UpdateRemoteMonitoring validates and updates an existing remote-monitoring.
func (s *Service) UpdateRemoteMonitoring(ctx context.Context, req dto.UpdateRemoteMonitoringRequest) (*dto.RemoteMonitoringResponse, error) {
	if err := validator.ValidateRemoteMonitoringUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.RemoteMonitoring{ID: req.ID}
	updated, err := s.repo.UpdateRemoteMonitoring(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RemoteMonitoringResponse{ID: updated.ID}, nil
}
