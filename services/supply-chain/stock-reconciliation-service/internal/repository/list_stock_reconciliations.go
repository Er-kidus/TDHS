package repository

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/model"
)

// ListStockReconciliations retrieves all stock-reconciliation records.
func (r *Repository) ListStockReconciliations(ctx context.Context) ([]*model.StockReconciliation, error) {
	return nil, nil
}
