package repository

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/model"
)

// GetRemoteMonitoring retrieves a single remote-monitoring record by ID.
func (r *Repository) GetRemoteMonitoring(ctx context.Context, id string) (*model.RemoteMonitoring, error) {
	return nil, nil
}
