package repository

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/model"
)

// GetRadiologyWorkflow retrieves a single radiology-workflow record by ID.
func (r *Repository) GetRadiologyWorkflow(ctx context.Context, id string) (*model.RadiologyWorkflow, error) {
	return nil, nil
}
