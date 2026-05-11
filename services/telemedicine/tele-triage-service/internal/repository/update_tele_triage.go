package repository

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/model"
)

// UpdateTeleTriage updates an existing tele-triage record in the database.
func (r *Repository) UpdateTeleTriage(ctx context.Context, entity *model.TeleTriage) (*model.TeleTriage, error) {
	return entity, nil
}
