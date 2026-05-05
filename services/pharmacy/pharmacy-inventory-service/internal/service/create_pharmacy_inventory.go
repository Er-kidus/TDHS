package service

import (
	"context"
	"github.com/tenadam/pharmacy-inventory-service/internal/dto"
	"github.com/tenadam/pharmacy-inventory-service/internal/model"
	"github.com/tenadam/pharmacy-inventory-service/internal/validator"
)

// CreatePharmacyInventory validates and creates a new pharmacy-inventory.
func (s *Service) CreatePharmacyInventory(ctx context.Context, req dto.CreatePharmacyInventoryRequest) (*dto.PharmacyInventoryResponse, error) {
	if err := validator.ValidatePharmacyInventoryCreate(req); err != nil {
		return nil, err
	}
	entity := &model.PharmacyInventory{}
	created, err := s.repo.CreatePharmacyInventory(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PharmacyInventoryResponse{ID: created.ID}, nil
}
