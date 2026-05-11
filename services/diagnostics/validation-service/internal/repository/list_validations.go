package repository

import (
	"context"
	"github.com/tenadam/validation-service/internal/model"
)

// ListValidations retrieves all validation records.
func (r *Repository) ListValidations(ctx context.Context) ([]*model.Validation, error) {
	return nil, nil
}
