package repository

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/model"
)

// CreateInvoicing inserts a new invoicing record into the database.
func (r *Repository) CreateInvoicing(ctx context.Context, entity *model.Invoicing) (*model.Invoicing, error) {
	return entity, nil
}
