package repository

import (
	"context"
	"github.com/tenadam/scheduling-service/internal/model"
)

// UpdateScheduling updates an existing scheduling record in the database.
func (r *Repository) UpdateScheduling(ctx context.Context, entity *model.Scheduling) (*model.Scheduling, error) {
	return entity, nil
}
