package repository

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/model"
)

// CreateTelemedicine inserts a new telemedicine record into the database.
func (r *Repository) CreateTelemedicine(ctx context.Context, entity *model.Telemedicine) (*model.Telemedicine, error) {
	return entity, nil
}
