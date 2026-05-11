package repository

import (
	"context"
	"github.com/tenadam/tele-triage-service/internal/model"
)

// ListTeleTriages retrieves all tele-triage records.
func (r *Repository) ListTeleTriages(ctx context.Context) ([]*model.TeleTriage, error) {
	return nil, nil
}
