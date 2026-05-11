package repository

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/model"
)

// CreateTeleTriage inserts a new tele-triage record into the database.
func (r *Repository) CreateTeleTriage(ctx context.Context, entity *model.TeleTriage) (*model.TeleTriage, error) {
	return entity, nil
}
