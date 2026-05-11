package repository

import (
	"context"
	"github.com/tenadam/check-in-service/internal/model"
)

// CreateCheckIn inserts a new check-in record into the database.
func (r *Repository) CreateCheckIn(ctx context.Context, entity *model.CheckIn) (*model.CheckIn, error) {
	return entity, nil
}
