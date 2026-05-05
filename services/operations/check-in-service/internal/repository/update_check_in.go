package repository

import (
	"context"
	"github.com/tenadam/check-in-service/internal/model"
)

// UpdateCheckIn updates an existing check-in record in the database.
func (r *Repository) UpdateCheckIn(ctx context.Context, entity *model.CheckIn) (*model.CheckIn, error) {
	return entity, nil
}
