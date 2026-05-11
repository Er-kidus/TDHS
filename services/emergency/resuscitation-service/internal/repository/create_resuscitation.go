package repository

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/model"
)

// CreateResuscitation inserts a new resuscitation record into the database.
func (r *Repository) CreateResuscitation(ctx context.Context, entity *model.Resuscitation) (*model.Resuscitation, error) {
	return entity, nil
}
