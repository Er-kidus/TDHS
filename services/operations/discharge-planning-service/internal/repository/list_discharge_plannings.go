package repository

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/model"
)

// ListDischargePlannings retrieves all discharge-planning records.
func (r *Repository) ListDischargePlannings(ctx context.Context) ([]*model.DischargePlanning, error) {
	return nil, nil
}
