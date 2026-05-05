package repository

import (
	"context"
	"github.com/tenadam/invoicing-service/internal/model"
)

// ListInvoicings retrieves all invoicing records.
func (r *Repository) ListInvoicings(ctx context.Context) ([]*model.Invoicing, error) {
	return nil, nil
}
