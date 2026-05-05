package repository

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/model"
)

// CreateTeleconsult inserts a new teleconsult record into the database.
func (r *Repository) CreateTeleconsult(ctx context.Context, entity *model.Teleconsult) (*model.Teleconsult, error) {
	return entity, nil
}
