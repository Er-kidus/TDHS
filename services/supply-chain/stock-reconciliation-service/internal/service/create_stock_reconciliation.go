package service

import (
	"context"
	"github.com/tenadam/stock-reconciliation-service/internal/dto"
	"github.com/tenadam/stock-reconciliation-service/internal/model"
	"github.com/tenadam/stock-reconciliation-service/internal/validator"
)

// CreateStockReconciliation validates and creates a new stock-reconciliation.
func (s *Service) CreateStockReconciliation(ctx context.Context, req dto.CreateStockReconciliationRequest) (*dto.StockReconciliationResponse, error) {
	if err := validator.ValidateStockReconciliationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.StockReconciliation{}
	created, err := s.repo.CreateStockReconciliation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.StockReconciliationResponse{ID: created.ID}, nil
}
