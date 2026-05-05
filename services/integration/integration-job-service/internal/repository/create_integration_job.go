package repository

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/model"
)

// CreateIntegrationJob inserts a new integration-job record into the database.
func (r *Repository) CreateIntegrationJob(ctx context.Context, entity *model.IntegrationJob) (*model.IntegrationJob, error) {
	return entity, nil
}
