package service

import (
	"context"
	"github.com/tenadam/inventory-service/internal/dto"
)

// GetInventory retrieves a single inventory by ID.
func (s *Service) GetInventory(ctx context.Context, id string) (*dto.InventoryResponse, error) {
	entity, err := s.repo.GetInventory(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.InventoryResponse{ID: entity.ID}, nil
}
