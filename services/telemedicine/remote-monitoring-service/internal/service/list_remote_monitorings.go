package service

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/dto"
)

// ListRemoteMonitorings retrieves all remote-monitorings.
func (s *Service) ListRemoteMonitorings(ctx context.Context) (*dto.ListRemoteMonitoringResponse, error) {
	entities, err := s.repo.ListRemoteMonitorings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.RemoteMonitoringResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.RemoteMonitoringResponse{ID: e.ID})
	}
	return &dto.ListRemoteMonitoringResponse{Items: items, Total: len(items)}, nil
}
