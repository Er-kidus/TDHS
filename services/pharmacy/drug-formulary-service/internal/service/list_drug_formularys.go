package service

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/dto"
)

// ListDrugFormularys retrieves all drug-formularys.
func (s *Service) ListDrugFormularys(ctx context.Context) (*dto.ListDrugFormularyResponse, error) {
	entities, err := s.repo.ListDrugFormularys(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DrugFormularyResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DrugFormularyResponse{ID: e.ID})
	}
	return &dto.ListDrugFormularyResponse{Items: items, Total: len(items)}, nil
}
