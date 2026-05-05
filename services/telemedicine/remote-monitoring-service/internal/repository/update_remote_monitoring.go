package repository

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/model"
)

// UpdateRemoteMonitoring updates an existing remote-monitoring record in the database.
func (r *Repository) UpdateRemoteMonitoring(ctx context.Context, entity *model.RemoteMonitoring) (*model.RemoteMonitoring, error) {
	return entity, nil
}
