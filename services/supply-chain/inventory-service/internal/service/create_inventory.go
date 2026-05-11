package service

import (
	"context"
	"github.com/tenadam/inventory-service/internal/dto"
	"github.com/tenadam/inventory-service/internal/model"
	"github.com/tenadam/inventory-service/internal/validator"
)

// CreateInventory validates and creates a new inventory.
func (s *Service) CreateInventory(ctx context.Context, req dto.CreateInventoryRequest) (*dto.InventoryResponse, error) {
	if err := validator.ValidateInventoryCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Inventory{}
	created, err := s.repo.CreateInventory(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InventoryResponse{ID: created.ID}, nil
}
