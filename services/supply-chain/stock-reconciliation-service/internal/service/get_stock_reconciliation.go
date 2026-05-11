package service

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
)

// GetStockReconciliation retrieves a single stock-reconciliation by ID.
func (s *Service) GetStockReconciliation(ctx context.Context, id string) (*dto.StockReconciliationResponse, error) {
	entity, err := s.repo.GetStockReconciliation(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.StockReconciliationResponse{ID: entity.ID}, nil
}
