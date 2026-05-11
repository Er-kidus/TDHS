package repository

import (
	"context"
	"github.com/tenadam/validation-service/internal/model"
)

// UpdateValidation updates an existing validation record in the database.
func (r *Repository) UpdateValidation(ctx context.Context, entity *model.Validation) (*model.Validation, error) {
	return entity, nil
}
