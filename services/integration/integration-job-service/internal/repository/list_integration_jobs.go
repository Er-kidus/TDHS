package repository

import (
	"context"
	"github.com/tenadam/integration-job-service/internal/model"
)

// ListIntegrationJobs retrieves all integration-job records.
func (r *Repository) ListIntegrationJobs(ctx context.Context) ([]*model.IntegrationJob, error) {
	return nil, nil
}
