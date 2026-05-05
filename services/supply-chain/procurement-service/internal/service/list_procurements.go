package service

import (
	"context"
	"github.com/tenadam/procurement-service/internal/dto"
)

// ListProcurements retrieves all procurements.
func (s *Service) ListProcurements(ctx context.Context) (*dto.ListProcurementResponse, error) {
	entities, err := s.repo.ListProcurements(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ProcurementResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ProcurementResponse{ID: e.ID})
	}
	return &dto.ListProcurementResponse{Items: items, Total: len(items)}, nil
}
