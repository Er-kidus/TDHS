package service

import (
	"context"
	"github.com/tenadam/identifier-service/internal/dto"
	"github.com/tenadam/identifier-service/internal/model"
	"github.com/tenadam/identifier-service/internal/validator"
)

// UpdateIdentifier validates and updates an existing identifier.
func (s *Service) UpdateIdentifier(ctx context.Context, req dto.UpdateIdentifierRequest) (*dto.IdentifierResponse, error) {
	if err := validator.ValidateIdentifierUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Identifier{ID: req.ID}
	updated, err := s.repo.UpdateIdentifier(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IdentifierResponse{ID: updated.ID}, nil
}
