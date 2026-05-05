package repository

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/model"
)

// UpdateLabWorkflow updates an existing lab-workflow record in the database.
func (r *Repository) UpdateLabWorkflow(ctx context.Context, entity *model.LabWorkflow) (*model.LabWorkflow, error) {
	return entity, nil
}
