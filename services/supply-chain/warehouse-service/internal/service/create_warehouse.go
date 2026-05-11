package service

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/dto"
	"github.com/tenadam/warehouse-service/internal/model"
	"github.com/tenadam/warehouse-service/internal/validator"
)

// CreateWarehouse validates and creates a new warehouse.
func (s *Service) CreateWarehouse(ctx context.Context, req dto.CreateWarehouseRequest) (*dto.WarehouseResponse, error) {
	if err := validator.ValidateWarehouseCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Warehouse{}
	created, err := s.repo.CreateWarehouse(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.WarehouseResponse{ID: created.ID}, nil
}
