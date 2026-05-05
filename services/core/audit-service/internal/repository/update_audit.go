package repository

import (
	"context"
	"github.com/tenadam/audit-service/internal/model"
)

// UpdateAudit updates an existing audit record in the database.
func (r *Repository) UpdateAudit(ctx context.Context, entity *model.Audit) (*model.Audit, error) {
	return entity, nil
}
