package repository

import (
	"context"
	"github.com/tenadam/triage-service/internal/model"
)

// CreateTriage inserts a new triage record into the database.
func (r *Repository) CreateTriage(ctx context.Context, entity *model.Triage) (*model.Triage, error) {
	return entity, nil
}
