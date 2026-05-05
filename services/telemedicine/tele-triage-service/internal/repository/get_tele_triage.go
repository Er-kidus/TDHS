package repository

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/model"
)

// GetTeleTriage retrieves a single tele-triage record by ID.
func (r *Repository) GetTeleTriage(ctx context.Context, id string) (*model.TeleTriage, error) {
	return nil, nil
}
