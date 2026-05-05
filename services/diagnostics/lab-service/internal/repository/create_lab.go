package repository

import (
	"context"
	"github.com/tenadam/lab-service/internal/model"
)

// CreateLab inserts a new lab record into the database.
func (r *Repository) CreateLab(ctx context.Context, entity *model.Lab) (*model.Lab, error) {
	return entity, nil
}
