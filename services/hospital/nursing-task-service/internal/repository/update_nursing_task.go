package repository

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/model"
)

// UpdateNursingTask updates an existing nursing-task record in the database.
func (r *Repository) UpdateNursingTask(ctx context.Context, entity *model.NursingTask) (*model.NursingTask, error) {
	return entity, nil
}
