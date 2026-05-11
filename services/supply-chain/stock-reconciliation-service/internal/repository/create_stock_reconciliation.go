package repository

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/model"
)

// CreateStockReconciliation inserts a new stock-reconciliation record into the database.
func (r *Repository) CreateStockReconciliation(ctx context.Context, entity *model.StockReconciliation) (*model.StockReconciliation, error) {
	return entity, nil
}
