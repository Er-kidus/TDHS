package repository

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/model"
)

// ListResuscitations retrieves all resuscitation records.
func (r *Repository) ListResuscitations(ctx context.Context) ([]*model.Resuscitation, error) {
	return nil, nil
}
