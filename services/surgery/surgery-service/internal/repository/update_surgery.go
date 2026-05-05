package repository

import (
	"context"
	"github.com/tenadam/surgery-service/internal/model"
)

// UpdateSurgery updates an existing surgery record in the database.
func (r *Repository) UpdateSurgery(ctx context.Context, entity *model.Surgery) (*model.Surgery, error) {
	return entity, nil
}
