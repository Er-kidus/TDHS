package repository

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/model"
)

// ListPostOperativeCares retrieves all post-operative-care records.
func (r *Repository) ListPostOperativeCares(ctx context.Context) ([]*model.PostOperativeCare, error) {
	return nil, nil
}
