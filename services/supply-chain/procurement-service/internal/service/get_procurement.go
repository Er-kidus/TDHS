package service

import (
	"context"
	"github.com/tenadam/procurement-service/internal/dto"
)

// GetProcurement retrieves a single procurement by ID.
func (s *Service) GetProcurement(ctx context.Context, id string) (*dto.ProcurementResponse, error) {
	entity, err := s.repo.GetProcurement(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ProcurementResponse{ID: entity.ID}, nil
}
