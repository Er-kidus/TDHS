package repository

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/model"
)

// UpdateTelemedicine updates an existing telemedicine record in the database.
func (r *Repository) UpdateTelemedicine(ctx context.Context, entity *model.Telemedicine) (*model.Telemedicine, error) {
	return entity, nil
}
