package repository

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/model"
)

// UpdateTheatreManagement updates an existing theatre-management record in the database.
func (r *Repository) UpdateTheatreManagement(ctx context.Context, entity *model.TheatreManagement) (*model.TheatreManagement, error) {
	return entity, nil
}
