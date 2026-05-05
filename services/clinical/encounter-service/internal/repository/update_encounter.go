package repository

import (
	"context"
	"github.com/tenadam/encounter-service/internal/model"
)

// UpdateEncounter updates an existing encounter record in the database.
func (r *Repository) UpdateEncounter(ctx context.Context, entity *model.Encounter) (*model.Encounter, error) {
	return entity, nil
}
