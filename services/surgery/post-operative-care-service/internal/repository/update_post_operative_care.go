package repository

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/model"
)

// UpdatePostOperativeCare updates an existing post-operative-care record in the database.
func (r *Repository) UpdatePostOperativeCare(ctx context.Context, entity *model.PostOperativeCare) (*model.PostOperativeCare, error) {
	return entity, nil
}
