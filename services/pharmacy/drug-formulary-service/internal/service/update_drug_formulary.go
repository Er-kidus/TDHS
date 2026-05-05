package service

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/dto"
	"github.com/tenadam/drug-formulary-service/internal/model"
	"github.com/tenadam/drug-formulary-service/internal/validator"
)

// UpdateDrugFormulary validates and updates an existing drug-formulary.
func (s *Service) UpdateDrugFormulary(ctx context.Context, req dto.UpdateDrugFormularyRequest) (*dto.DrugFormularyResponse, error) {
	if err := validator.ValidateDrugFormularyUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.DrugFormulary{ID: req.ID}
	updated, err := s.repo.UpdateDrugFormulary(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DrugFormularyResponse{ID: updated.ID}, nil
}
