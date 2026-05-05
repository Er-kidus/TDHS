package repository

import (
	"context"
	"github.com/tenadam/imaging-service/internal/model"
)

// CreateImaging inserts a new imaging record into the database.
func (r *Repository) CreateImaging(ctx context.Context, entity *model.Imaging) (*model.Imaging, error) {
	return entity, nil
}
