package repository

import (
	"context"
	"github.com/tenadam/discharge-planning-service/internal/model"
)

// GetDischargePlanning retrieves a single discharge-planning record by ID.
func (r *Repository) GetDischargePlanning(ctx context.Context, id string) (*model.DischargePlanning, error) {
	return nil, nil
}
