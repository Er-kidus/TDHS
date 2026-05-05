package repository

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/model"
)

// UpdateInvoicing updates an existing invoicing record in the database.
func (r *Repository) UpdateInvoicing(ctx context.Context, entity *model.Invoicing) (*model.Invoicing, error) {
	return entity, nil
}
