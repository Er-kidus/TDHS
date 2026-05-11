package repository

import (
	"context"
	"github.com/tenadam/emergency-service/internal/model"
)

// ListEmergencys retrieves all emergency records.
func (r *Repository) ListEmergencys(ctx context.Context) ([]*model.Emergency, error) {
	return nil, nil
}
