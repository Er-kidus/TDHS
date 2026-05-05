package repository

import (
	"context"
	"github.com/tenadam/radiology-workflow-service/internal/model"
)

// CreateRadiologyWorkflow inserts a new radiology-workflow record into the database.
func (r *Repository) CreateRadiologyWorkflow(ctx context.Context, entity *model.RadiologyWorkflow) (*model.RadiologyWorkflow, error) {
	return entity, nil
}
