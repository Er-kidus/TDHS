package repository

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/model"
)

// GetSurveillance retrieves a single surveillance record by ID.
func (r *Repository) GetSurveillance(ctx context.Context, id string) (*model.Surveillance, error) {
	return nil, nil
}
