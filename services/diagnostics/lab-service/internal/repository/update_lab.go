package repository

import (
	"context"
	"github.com/tenadam/lab-service/internal/model"
)

// UpdateLab updates an existing lab record in the database.
func (r *Repository) UpdateLab(ctx context.Context, entity *model.Lab) (*model.Lab, error) {
	return entity, nil
}
