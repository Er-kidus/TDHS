package repository

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/model"
)

// GetNursingTask retrieves a single nursing-task record by ID.
func (r *Repository) GetNursingTask(ctx context.Context, id string) (*model.NursingTask, error) {
	return nil, nil
}
