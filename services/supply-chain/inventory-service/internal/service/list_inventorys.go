package service

import (
	"context"
	"github.com/tenadam/inventory-service/internal/dto"
)

// ListInventorys retrieves all inventorys.
func (s *Service) ListInventorys(ctx context.Context) (*dto.ListInventoryResponse, error) {
	entities, err := s.repo.ListInventorys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.InventoryResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.InventoryResponse{ID: e.ID})
	}
	return &dto.ListInventoryResponse{Items: items, Total: len(items)}, nil
}
