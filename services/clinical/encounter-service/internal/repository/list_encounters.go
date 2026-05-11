package repository

import (
	"context"
	"github.com/tenadam/encounter-service/internal/model"
)

// ListEncounters retrieves all encounter records.
func (r *Repository) ListEncounters(ctx context.Context) ([]*model.Encounter, error) {
	return nil, nil
}
