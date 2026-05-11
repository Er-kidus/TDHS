package service

import (
	"context"
	"github.com/tenadam/specimen-service/internal/dto"
	"github.com/tenadam/specimen-service/internal/model"
	"github.com/tenadam/specimen-service/internal/validator"
)

// UpdateSpecimen validates and updates an existing specimen.
func (s *Service) UpdateSpecimen(ctx context.Context, req dto.UpdateSpecimenRequest) (*dto.SpecimenResponse, error) {
	if err := validator.ValidateSpecimenUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Specimen{ID: req.ID}
	updated, err := s.repo.UpdateSpecimen(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SpecimenResponse{ID: updated.ID}, nil
}
