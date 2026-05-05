package service

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
)

// GetPharmacyInventory retrieves a single pharmacy-inventory by ID.
func (s *Service) GetPharmacyInventory(ctx context.Context, id string) (*dto.PharmacyInventoryResponse, error) {
	entity, err := s.repo.GetPharmacyInventory(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PharmacyInventoryResponse{ID: entity.ID}, nil
}
