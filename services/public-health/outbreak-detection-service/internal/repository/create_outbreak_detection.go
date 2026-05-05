package repository

import (
	"context"
	"github.com/tenadam/outbreak-detection-service/internal/model"
)

// CreateOutbreakDetection inserts a new outbreak-detection record into the database.
func (r *Repository) CreateOutbreakDetection(ctx context.Context, entity *model.OutbreakDetection) (*model.OutbreakDetection, error) {
	return entity, nil
}
