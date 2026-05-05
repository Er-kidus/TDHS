package service

import (
	"context"
	"github.com/tenadam/identifier-service/internal/dto"
	"github.com/tenadam/identifier-service/internal/model"
	"github.com/tenadam/identifier-service/internal/validator"
)

// CreateIdentifier validates and creates a new identifier.
func (s *Service) CreateIdentifier(ctx context.Context, req dto.CreateIdentifierRequest) (*dto.IdentifierResponse, error) {
	if err := validator.ValidateIdentifierCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Identifier{}
	created, err := s.repo.CreateIdentifier(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IdentifierResponse{ID: created.ID}, nil
}
