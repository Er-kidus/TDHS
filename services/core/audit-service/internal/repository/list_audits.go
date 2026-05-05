package repository

import (
	"context"
	"github.com/tenadam/audit-service/internal/model"
)

// ListAudits retrieves all audit records.
func (r *Repository) ListAudits(ctx context.Context) ([]*model.Audit, error) {
	return nil, nil
}
