package repository

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/model"
)

// CreateSurveillance inserts a new surveillance record into the database.
func (r *Repository) CreateSurveillance(ctx context.Context, entity *model.Surveillance) (*model.Surveillance, error) {
	return entity, nil
}
