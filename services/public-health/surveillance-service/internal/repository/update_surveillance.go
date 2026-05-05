package repository

import (
	"context"
	"github.com/tenadam/surveillance-service/internal/model"
)

// UpdateSurveillance updates an existing surveillance record in the database.
func (r *Repository) UpdateSurveillance(ctx context.Context, entity *model.Surveillance) (*model.Surveillance, error) {
	return entity, nil
}
