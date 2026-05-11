package service

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
)

// ListStockReconciliations retrieves all stock-reconciliations.
func (s *Service) ListStockReconciliations(ctx context.Context) (*dto.ListStockReconciliationResponse, error) {
	entities, err := s.repo.ListStockReconciliations(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.StockReconciliationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.StockReconciliationResponse{ID: e.ID})
	}
	return &dto.ListStockReconciliationResponse{Items: items, Total: len(items)}, nil
}
