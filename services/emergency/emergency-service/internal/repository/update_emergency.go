package repository

import (
	"context"
	"github.com/tenadam/emergency-service/internal/model"
)

// UpdateEmergency updates an existing emergency record in the database.
func (r *Repository) UpdateEmergency(ctx context.Context, entity *model.Emergency) (*model.Emergency, error) {
	return entity, nil
}
