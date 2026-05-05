package service

import (
	"context"
	"github.com/tenadam/terminology-service/internal/dto"
	"github.com/tenadam/terminology-service/internal/model"
	"github.com/tenadam/terminology-service/internal/validator"
)

// CreateTerminology validates and creates a new terminology.
func (s *Service) CreateTerminology(ctx context.Context, req dto.CreateTerminologyRequest) (*dto.TerminologyResponse, error) {
	if err := validator.ValidateTerminologyCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Terminology{}
	created, err := s.repo.CreateTerminology(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TerminologyResponse{ID: created.ID}, nil
}
