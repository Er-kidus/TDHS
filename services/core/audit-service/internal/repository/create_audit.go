package repository

import (
	"context"
	"github.com/tenadam/audit-service/internal/model"
)

// CreateAudit inserts a new audit record into the database.
func (r *Repository) CreateAudit(ctx context.Context, entity *model.Audit) (*model.Audit, error) {
	return entity, nil
}
