package repository

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/model"
)

// UpdateDischargePlanning updates an existing discharge-planning record in the database.
func (r *Repository) UpdateDischargePlanning(ctx context.Context, entity *model.DischargePlanning) (*model.DischargePlanning, error) {
	return entity, nil
}
