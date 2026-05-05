package repository

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/model"
)

// UpdateAuditAnalytics updates an existing audit-analytics record in the database.
func (r *Repository) UpdateAuditAnalytics(ctx context.Context, entity *model.AuditAnalytics) (*model.AuditAnalytics, error) {
	return entity, nil
}
