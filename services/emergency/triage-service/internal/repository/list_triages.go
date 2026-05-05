package repository

import (
	"context"
	"github.com/tenadam/triage-service/internal/model"
)

// ListTriages retrieves all triage records.
func (r *Repository) ListTriages(ctx context.Context) ([]*model.Triage, error) {
	return nil, nil
}
