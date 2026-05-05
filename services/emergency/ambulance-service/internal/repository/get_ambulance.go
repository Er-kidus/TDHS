package repository

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/model"
)

// GetAmbulance retrieves a single ambulance record by ID.
func (r *Repository) GetAmbulance(ctx context.Context, id string) (*model.Ambulance, error) {
	return nil, nil
}
