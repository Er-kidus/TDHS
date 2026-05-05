package repository

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/model"
)

// UpdateOutbreakDetection updates an existing outbreak-detection record in the database.
func (r *Repository) UpdateOutbreakDetection(ctx context.Context, entity *model.OutbreakDetection) (*model.OutbreakDetection, error) {
	return entity, nil
}
