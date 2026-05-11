package service

import (
	"context"
	"github.com/tenadam/practitioner-service/internal/dto"
	"github.com/tenadam/practitioner-service/internal/model"
	"github.com/tenadam/practitioner-service/internal/validator"
)

// UpdatePractitioner validates and updates an existing practitioner.
func (s *Service) UpdatePractitioner(ctx context.Context, req dto.UpdatePractitionerRequest) (*dto.PractitionerResponse, error) {
	if err := validator.ValidatePractitionerUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Practitioner{ID: req.ID}
	updated, err := s.repo.UpdatePractitioner(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PractitionerResponse{ID: updated.ID}, nil
}
