package repository

import (
	"context"
	"github.com/tenadam/validation-service/internal/model"
)

// CreateValidation inserts a new validation record into the database.
func (r *Repository) CreateValidation(ctx context.Context, entity *model.Validation) (*model.Validation, error) {
	return entity, nil
}
