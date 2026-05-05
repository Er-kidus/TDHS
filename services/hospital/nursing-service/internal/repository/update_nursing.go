package repository

import (
	"context"
	"github.com/tenadam/nursing-service/internal/model"
)

// UpdateNursing updates an existing nursing record in the database.
func (r *Repository) UpdateNursing(ctx context.Context, entity *model.Nursing) (*model.Nursing, error) {
	return entity, nil
}
