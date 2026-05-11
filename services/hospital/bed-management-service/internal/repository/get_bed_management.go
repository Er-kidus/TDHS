package repository

import (
	"context"
	"github.com/tenadam/bed-management-service/internal/model"
)

// GetBedManagement retrieves a single bed-management record by ID.
func (r *Repository) GetBedManagement(ctx context.Context, id string) (*model.BedManagement, error) {
	return nil, nil
}
