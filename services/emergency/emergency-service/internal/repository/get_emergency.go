package repository

import (
	"context"
	"github.com/tenadam/emergency-service/internal/model"
)

// GetEmergency retrieves a single emergency record by ID.
func (r *Repository) GetEmergency(ctx context.Context, id string) (*model.Emergency, error) {
	return nil, nil
}
