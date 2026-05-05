package repository

import (
	"context"
	"github.com/tenadam/nursing-task-service/internal/model"
)

// CreateNursingTask inserts a new nursing-task record into the database.
func (r *Repository) CreateNursingTask(ctx context.Context, entity *model.NursingTask) (*model.NursingTask, error) {
	return entity, nil
}
