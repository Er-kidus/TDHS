package repository

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/model"
)

// UpdateRadiologyWorkflow updates an existing radiology-workflow record in the database.
func (r *Repository) UpdateRadiologyWorkflow(ctx context.Context, entity *model.RadiologyWorkflow) (*model.RadiologyWorkflow, error) {
	return entity, nil
}
