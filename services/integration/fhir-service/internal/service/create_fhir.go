package service

import (
	"context"
	"github.com/tenadam/fhir-service/internal/dto"
	"github.com/tenadam/fhir-service/internal/model"
	"github.com/tenadam/fhir-service/internal/validator"
)

// CreateFhir validates and creates a new fhir.
func (s *Service) CreateFhir(ctx context.Context, req dto.CreateFhirRequest) (*dto.FhirResponse, error) {
	if err := validator.ValidateFhirCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Fhir{}
	created, err := s.repo.CreateFhir(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.FhirResponse{ID: created.ID}, nil
}
