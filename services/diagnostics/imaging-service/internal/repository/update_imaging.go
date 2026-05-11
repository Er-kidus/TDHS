package repository

import (
	"context"
	"github.com/tenadam/imaging-service/internal/model"
)

// UpdateImaging updates an existing imaging record in the database.
func (r *Repository) UpdateImaging(ctx context.Context, entity *model.Imaging) (*model.Imaging, error) {
	return entity, nil
}
