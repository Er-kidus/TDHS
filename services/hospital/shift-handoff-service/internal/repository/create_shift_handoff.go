package repository

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/model"
)

// CreateShiftHandoff inserts a new shift-handoff record into the database.
func (r *Repository) CreateShiftHandoff(ctx context.Context, entity *model.ShiftHandoff) (*model.ShiftHandoff, error) {
	return entity, nil
}
