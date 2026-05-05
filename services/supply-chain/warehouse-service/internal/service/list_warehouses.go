package service

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/dto"
)

// ListWarehouses retrieves all warehouses.
func (s *Service) ListWarehouses(ctx context.Context) (*dto.ListWarehouseResponse, error) {
	entities, err := s.repo.ListWarehouses(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.WarehouseResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.WarehouseResponse{ID: e.ID})
	}
	return &dto.ListWarehouseResponse{Items: items, Total: len(items)}, nil
}
