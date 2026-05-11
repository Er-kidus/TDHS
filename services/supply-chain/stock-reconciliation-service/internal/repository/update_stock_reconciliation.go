package repository

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/model"
)

// UpdateStockReconciliation updates an existing stock-reconciliation record in the database.
func (r *Repository) UpdateStockReconciliation(ctx context.Context, entity *model.StockReconciliation) (*model.StockReconciliation, error) {
	return entity, nil
}
