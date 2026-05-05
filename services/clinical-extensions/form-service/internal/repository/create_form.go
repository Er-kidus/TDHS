package repository

import (
	"context"
	"github.com/tenadam/form-service/internal/model"
)

// CreateForm inserts a new form record into the database.
func (r *Repository) CreateForm(ctx context.Context, entity *model.Form) (*model.Form, error) {
	return entity, nil
}
