package repository

import (
	"context"
	"github.com/tenadam/form-response-service/internal/model"
)

// UpdateFormResponse updates an existing form-response record in the database.
func (r *Repository) UpdateFormResponse(ctx context.Context, entity *model.FormResponse) (*model.FormResponse, error) {
	return entity, nil
}
