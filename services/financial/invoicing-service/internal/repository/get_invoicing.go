package repository

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/model"
)

// GetInvoicing retrieves a single invoicing record by ID.
func (r *Repository) GetInvoicing(ctx context.Context, id string) (*model.Invoicing, error) {
	return nil, nil
}
