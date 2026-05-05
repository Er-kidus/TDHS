package repository

import (
	"context"
	"github.com/tenadam/form-service/internal/model"
)

// UpdateForm updates an existing form record in the database.
func (r *Repository) UpdateForm(ctx context.Context, entity *model.Form) (*model.Form, error) {
	return entity, nil
}
