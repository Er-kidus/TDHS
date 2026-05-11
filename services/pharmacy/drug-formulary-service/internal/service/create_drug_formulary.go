package service

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/dto"
	"github.com/tenadam/drug-formulary-service/internal/model"
	"github.com/tenadam/drug-formulary-service/internal/validator"
)

// CreateDrugFormulary validates and creates a new drug-formulary.
func (s *Service) CreateDrugFormulary(ctx context.Context, req dto.CreateDrugFormularyRequest) (*dto.DrugFormularyResponse, error) {
	if err := validator.ValidateDrugFormularyCreate(req); err != nil {
		return nil, err
	}
	entity := &model.DrugFormulary{}
	created, err := s.repo.CreateDrugFormulary(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DrugFormularyResponse{ID: created.ID}, nil
}
