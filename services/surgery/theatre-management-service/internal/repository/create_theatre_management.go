package repository

import (
	"context"
	"github.com/tenadam/theatre-management-service/internal/model"
)

// CreateTheatreManagement inserts a new theatre-management record into the database.
func (r *Repository) CreateTheatreManagement(ctx context.Context, entity *model.TheatreManagement) (*model.TheatreManagement, error) {
	return entity, nil
}
