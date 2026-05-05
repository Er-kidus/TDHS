package repository

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/model"
)

// ListSurveillances retrieves all surveillance records.
func (r *Repository) ListSurveillances(ctx context.Context) ([]*model.Surveillance, error) {
	return nil, nil
}
