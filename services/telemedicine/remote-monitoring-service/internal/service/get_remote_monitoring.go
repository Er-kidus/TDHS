package service

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
)

// GetRemoteMonitoring retrieves a single remote-monitoring by ID.
func (s *Service) GetRemoteMonitoring(ctx context.Context, id string) (*dto.RemoteMonitoringResponse, error) {
	entity, err := s.repo.GetRemoteMonitoring(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.RemoteMonitoringResponse{ID: entity.ID}, nil
}
