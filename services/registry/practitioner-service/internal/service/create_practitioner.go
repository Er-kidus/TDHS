package service

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/dto"
	"github.com/tenadam/practitioner-service/internal/model"
	"github.com/tenadam/practitioner-service/internal/validator"
)

// CreatePractitioner validates and creates a new practitioner.
func (s *Service) CreatePractitioner(ctx context.Context, req dto.CreatePractitionerRequest) (*dto.PractitionerResponse, error) {
	if err := validator.ValidatePractitionerCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Practitioner{}
	created, err := s.repo.CreatePractitioner(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PractitionerResponse{ID: created.ID}, nil
}
