package service

import (
	"context"
	"github.com/tenadam/fhir-service/internal/dto"
	"github.com/tenadam/fhir-service/internal/model"
	"github.com/tenadam/fhir-service/internal/validator"
)

// UpdateFhir validates and updates an existing fhir.
func (s *Service) UpdateFhir(ctx context.Context, req dto.UpdateFhirRequest) (*dto.FhirResponse, error) {
	if err := validator.ValidateFhirUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Fhir{ID: req.ID}
	updated, err := s.repo.UpdateFhir(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FhirResponse{ID: updated.ID}, nil
}
