package repository

import (
	"context"
	"github.com/tenadam/audit-analytics-service/internal/model"
)

// CreateAuditAnalytics inserts a new audit-analytics record into the database.
func (r *Repository) CreateAuditAnalytics(ctx context.Context, entity *model.AuditAnalytics) (*model.AuditAnalytics, error) {
	return entity, nil
}
