package repository

import (
	"context"
	"github.com/tenadam/triage-service/internal/model"
)

// GetTriage retrieves a single triage record by ID.
func (r *Repository) GetTriage(ctx context.Context, id string) (*model.Triage, error) {
	return nil, nil
}
