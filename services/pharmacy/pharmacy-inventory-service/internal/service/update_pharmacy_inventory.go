package service

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
	"github.com/tenadam/pharmacy-inventory-service/internal/model"
	"github.com/tenadam/pharmacy-inventory-service/internal/validator"
)

// UpdatePharmacyInventory validates and updates an existing pharmacy-inventory.
func (s *Service) UpdatePharmacyInventory(ctx context.Context, req dto.UpdatePharmacyInventoryRequest) (*dto.PharmacyInventoryResponse, error) {
	if err := validator.ValidatePharmacyInventoryUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.PharmacyInventory{ID: req.ID}
	updated, err := s.repo.UpdatePharmacyInventory(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PharmacyInventoryResponse{ID: updated.ID}, nil
}
