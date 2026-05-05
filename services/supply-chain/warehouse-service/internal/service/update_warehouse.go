package service

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/dto"
	"github.com/tenadam/warehouse-service/internal/model"
	"github.com/tenadam/warehouse-service/internal/validator"
)

// UpdateWarehouse validates and updates an existing warehouse.
func (s *Service) UpdateWarehouse(ctx context.Context, req dto.UpdateWarehouseRequest) (*dto.WarehouseResponse, error) {
	if err := validator.ValidateWarehouseUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Warehouse{ID: req.ID}
	updated, err := s.repo.UpdateWarehouse(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.WarehouseResponse{ID: updated.ID}, nil
}
