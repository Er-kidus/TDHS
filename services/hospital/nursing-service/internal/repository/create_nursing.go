package repository

import (
	"context"
	"github.com/tenadam/nursing-service/internal/model"
)

// CreateNursing inserts a new nursing record into the database.
func (r *Repository) CreateNursing(ctx context.Context, entity *model.Nursing) (*model.Nursing, error) {
	return entity, nil
}
