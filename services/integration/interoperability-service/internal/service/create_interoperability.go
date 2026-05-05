package service

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/dto"
	"github.com/tenadam/interoperability-service/internal/model"
	"github.com/tenadam/interoperability-service/internal/validator"
)

// CreateInteroperability validates and creates a new interoperability.
func (s *Service) CreateInteroperability(ctx context.Context, req dto.CreateInteroperabilityRequest) (*dto.InteroperabilityResponse, error) {
	if err := validator.ValidateInteroperabilityCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Interoperability{}
	created, err := s.repo.CreateInteroperability(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InteroperabilityResponse{ID: created.ID}, nil
}
