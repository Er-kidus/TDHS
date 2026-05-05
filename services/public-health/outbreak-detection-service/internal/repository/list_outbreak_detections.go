package repository

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/model"
)

// ListOutbreakDetections retrieves all outbreak-detection records.
func (r *Repository) ListOutbreakDetections(ctx context.Context) ([]*model.OutbreakDetection, error) {
	return nil, nil
}
