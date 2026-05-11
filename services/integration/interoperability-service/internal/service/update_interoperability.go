package service

import (
	"context"
	"github.com/tenadam/interoperability-service/internal/dto"
	"github.com/tenadam/interoperability-service/internal/model"
	"github.com/tenadam/interoperability-service/internal/validator"
)

// UpdateInteroperability validates and updates an existing interoperability.
func (s *Service) UpdateInteroperability(ctx context.Context, req dto.UpdateInteroperabilityRequest) (*dto.InteroperabilityResponse, error) {
	if err := validator.ValidateInteroperabilityUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Interoperability{ID: req.ID}
	updated, err := s.repo.UpdateInteroperability(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.InteroperabilityResponse{ID: updated.ID}, nil
}
