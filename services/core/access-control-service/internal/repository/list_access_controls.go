package repository

import (
	"context"
	"github.com/tenadam/access-control-service/internal/model"
)

// ListAccessControls retrieves all access-control records.
func (r *Repository) ListAccessControls(ctx context.Context) ([]*model.AccessControl, error) {
	return nil, nil
}
