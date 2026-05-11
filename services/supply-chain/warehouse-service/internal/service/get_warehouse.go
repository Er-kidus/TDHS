package service

import (
	"context"
	"github.com/tenadam/warehouse-service/internal/dto"
)

// GetWarehouse retrieves a single warehouse by ID.
func (s *Service) GetWarehouse(ctx context.Context, id string) (*dto.WarehouseResponse, error) {
	entity, err := s.repo.GetWarehouse(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.WarehouseResponse{ID: entity.ID}, nil
}
