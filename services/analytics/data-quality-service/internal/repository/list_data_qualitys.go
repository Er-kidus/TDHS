package repository

import (
	"context"
	"github.com/tenadam/data-quality-service/internal/model"
)

// ListDataQualitys retrieves all data-quality records.
func (r *Repository) ListDataQualitys(ctx context.Context) ([]*model.DataQuality, error) {
	return nil, nil
}
