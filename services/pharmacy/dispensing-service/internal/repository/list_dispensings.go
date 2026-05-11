package repository

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/model"
)

// ListDispensings retrieves all dispensing records.
func (r *Repository) ListDispensings(ctx context.Context) ([]*model.Dispensing, error) {
	return nil, nil
}
