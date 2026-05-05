package service

import (
	"context"
	"github.com/tenadam/specimen-service/internal/dto"
	"github.com/tenadam/specimen-service/internal/model"
	"github.com/tenadam/specimen-service/internal/validator"
)

// CreateSpecimen validates and creates a new specimen.
func (s *Service) CreateSpecimen(ctx context.Context, req dto.CreateSpecimenRequest) (*dto.SpecimenResponse, error) {
	if err := validator.ValidateSpecimenCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Specimen{}
	created, err := s.repo.CreateSpecimen(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SpecimenResponse{ID: created.ID}, nil
}
