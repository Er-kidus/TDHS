package service

import (
	"context"
	"github.com/tenadam/inventory-service/internal/dto"
	"github.com/tenadam/inventory-service/internal/model"
	"github.com/tenadam/inventory-service/internal/validator"
)

// UpdateInventory validates and updates an existing inventory.
func (s *Service) UpdateInventory(ctx context.Context, req dto.UpdateInventoryRequest) (*dto.InventoryResponse, error) {
	if err := validator.ValidateInventoryUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Inventory{ID: req.ID}
	updated, err := s.repo.UpdateInventory(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InventoryResponse{ID: updated.ID}, nil
}
