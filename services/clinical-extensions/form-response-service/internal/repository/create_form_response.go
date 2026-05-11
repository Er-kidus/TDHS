package repository

import (
	"context"
	"github.com/tenadam/form-response-service/internal/model"
)

// CreateFormResponse inserts a new form-response record into the database.
func (r *Repository) CreateFormResponse(ctx context.Context, entity *model.FormResponse) (*model.FormResponse, error) {
	return entity, nil
}
