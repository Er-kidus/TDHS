package service

import (
	"context"
	"github.com/tenadam/terminology-service/internal/dto"
	"github.com/tenadam/terminology-service/internal/model"
	"github.com/tenadam/terminology-service/internal/validator"
)

// UpdateTerminology validates and updates an existing terminology.
func (s *Service) UpdateTerminology(ctx context.Context, req dto.UpdateTerminologyRequest) (*dto.TerminologyResponse, error) {
	if err := validator.ValidateTerminologyUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Terminology{ID: req.ID}
	updated, err := s.repo.UpdateTerminology(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TerminologyResponse{ID: updated.ID}, nil
}
