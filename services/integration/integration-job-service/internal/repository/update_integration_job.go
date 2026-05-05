package repository

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/model"
)

// UpdateIntegrationJob updates an existing integration-job record in the database.
func (r *Repository) UpdateIntegrationJob(ctx context.Context, entity *model.IntegrationJob) (*model.IntegrationJob, error) {
	return entity, nil
}
