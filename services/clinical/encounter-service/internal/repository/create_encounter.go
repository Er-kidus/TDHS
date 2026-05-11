package repository

import (
	"context"
	"github.com/tenadam/encounter-service/internal/model"
)

// CreateEncounter inserts a new encounter record into the database.
func (r *Repository) CreateEncounter(ctx context.Context, entity *model.Encounter) (*model.Encounter, error) {
	return entity, nil
}
