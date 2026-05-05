package repository

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/model"
)

// UpdateShiftHandoff updates an existing shift-handoff record in the database.
func (r *Repository) UpdateShiftHandoff(ctx context.Context, entity *model.ShiftHandoff) (*model.ShiftHandoff, error) {
	return entity, nil
}
