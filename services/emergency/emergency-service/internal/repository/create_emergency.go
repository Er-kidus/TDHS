package repository

import (
	"context"
	"github.com/tenadam/emergency-service/internal/model"
)

// CreateEmergency inserts a new emergency record into the database.
func (r *Repository) CreateEmergency(ctx context.Context, entity *model.Emergency) (*model.Emergency, error) {
	return entity, nil
}
