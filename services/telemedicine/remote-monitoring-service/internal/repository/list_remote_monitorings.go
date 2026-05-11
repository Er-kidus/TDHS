package repository

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/model"
)

// ListRemoteMonitorings retrieves all remote-monitoring records.
func (r *Repository) ListRemoteMonitorings(ctx context.Context) ([]*model.RemoteMonitoring, error) {
	return nil, nil
}
