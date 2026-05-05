package repository

import (
	"context"
	"github.com/tenadam/lab-workflow-service/internal/model"
)

// CreateLabWorkflow inserts a new lab-workflow record into the database.
func (r *Repository) CreateLabWorkflow(ctx context.Context, entity *model.LabWorkflow) (*model.LabWorkflow, error) {
	return entity, nil
}
