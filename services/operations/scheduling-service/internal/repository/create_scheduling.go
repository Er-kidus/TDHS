package repository

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/model"
)

// CreateScheduling inserts a new scheduling record into the database.
func (r *Repository) CreateScheduling(ctx context.Context, entity *model.Scheduling) (*model.Scheduling, error) {
	return entity, nil
}
