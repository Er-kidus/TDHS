package repository

import (
	"context"
	"github.com/tenadam/procurement-service/internal/model"
)

// UpdateProcurement updates an existing procurement record in the database.
func (r *Repository) UpdateProcurement(ctx context.Context, entity *model.Procurement) (*model.Procurement, error) {
	return entity, nil
}
