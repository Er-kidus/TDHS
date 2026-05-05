package service

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
	"github.com/tenadam/stock-reconciliation-service/internal/model"
	"github.com/tenadam/stock-reconciliation-service/internal/validator"
)

// UpdateStockReconciliation validates and updates an existing stock-reconciliation.
func (s *Service) UpdateStockReconciliation(ctx context.Context, req dto.UpdateStockReconciliationRequest) (*dto.StockReconciliationResponse, error) {
	if err := validator.ValidateStockReconciliationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.StockReconciliation{ID: req.ID}
	updated, err := s.repo.UpdateStockReconciliation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.StockReconciliationResponse{ID: updated.ID}, nil
}
