package service

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/dto"
)

// GetDrugFormulary retrieves a single drug-formulary by ID.
func (s *Service) GetDrugFormulary(ctx context.Context, id string) (*dto.DrugFormularyResponse, error) {
	entity, err := s.repo.GetDrugFormulary(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.DrugFormularyResponse{ID: entity.ID}, nil
}
