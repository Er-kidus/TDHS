package repository

import (
	"context"
	"github.com/tenadam/check-in-service/internal/model"
)

// ListCheckIns retrieves all check-in records.
func (r *Repository) ListCheckIns(ctx context.Context) ([]*model.CheckIn, error) {
	return nil, nil
}
