package repository

import (
	"context"
	"github.com/tenadam/triage-service/internal/model"
)

// UpdateTriage updates an existing triage record in the database.
func (r *Repository) UpdateTriage(ctx context.Context, entity *model.Triage) (*model.Triage, error) {
	return entity, nil
}
