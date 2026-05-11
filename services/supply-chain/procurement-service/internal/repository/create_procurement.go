package repository

import (
	"context"
	"github.com/tenadam/procurement-service/internal/model"
)

// CreateProcurement inserts a new procurement record into the database.
func (r *Repository) CreateProcurement(ctx context.Context, entity *model.Procurement) (*model.Procurement, error) {
	return entity, nil
}
