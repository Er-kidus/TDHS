package repository

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/model"
)

// CreatePostOperativeCare inserts a new post-operative-care record into the database.
func (r *Repository) CreatePostOperativeCare(ctx context.Context, entity *model.PostOperativeCare) (*model.PostOperativeCare, error) {
	return entity, nil
}
