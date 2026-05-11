package service

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
)

// ListPharmacyInventorys retrieves all pharmacy-inventorys.
func (s *Service) ListPharmacyInventorys(ctx context.Context) (*dto.ListPharmacyInventoryResponse, error) {
	entities, err := s.repo.ListPharmacyInventorys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.PharmacyInventoryResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.PharmacyInventoryResponse{ID: e.ID})
	}
	return &dto.ListPharmacyInventoryResponse{Items: items, Total: len(items)}, nil
}
