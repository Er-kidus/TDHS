package repository

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/model"
)

// UpdateTeleconsult updates an existing teleconsult record in the database.
func (r *Repository) UpdateTeleconsult(ctx context.Context, entity *model.Teleconsult) (*model.Teleconsult, error) {
	return entity, nil
}
