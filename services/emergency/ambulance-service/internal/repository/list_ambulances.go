package repository

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/model"
)

// ListAmbulances retrieves all ambulance records.
func (r *Repository) ListAmbulances(ctx context.Context) ([]*model.Ambulance, error) {
	return nil, nil
}
