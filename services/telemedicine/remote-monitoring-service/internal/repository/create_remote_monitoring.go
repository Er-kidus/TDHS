package repository

import (
	"context"
	"github.com/tenadam/remote-monitoring-service/internal/model"
)

// CreateRemoteMonitoring inserts a new remote-monitoring record into the database.
func (r *Repository) CreateRemoteMonitoring(ctx context.Context, entity *model.RemoteMonitoring) (*model.RemoteMonitoring, error) {
	return entity, nil
}
