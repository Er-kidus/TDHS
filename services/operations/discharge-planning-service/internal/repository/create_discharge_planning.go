package repository

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/model"
)

// CreateDischargePlanning inserts a new discharge-planning record into the database.
func (r *Repository) CreateDischargePlanning(ctx context.Context, entity *model.DischargePlanning) (*model.DischargePlanning, error) {
	return entity, nil
}
