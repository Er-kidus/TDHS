package service

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
	"github.com/tenadam/remote-monitoring-service/internal/model"
	"github.com/tenadam/remote-monitoring-service/internal/validator"
)

// CreateRemoteMonitoring validates and creates a new remote-monitoring.
func (s *Service) CreateRemoteMonitoring(ctx context.Context, req dto.CreateRemoteMonitoringRequest) (*dto.RemoteMonitoringResponse, error) {
	if err := validator.ValidateRemoteMonitoringCreate(req); err != nil {
		return nil, err
	}
	entity := &model.RemoteMonitoring{}
	created, err := s.repo.CreateRemoteMonitoring(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.RemoteMonitoringResponse{ID: created.ID}, nil
}
