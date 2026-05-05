package service

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/dto"
	"github.com/tenadam/teleconsult-service/internal/model"
	"github.com/tenadam/teleconsult-service/internal/validator"
)

// UpdateTeleconsult validates and updates an existing teleconsult.
func (s *Service) UpdateTeleconsult(ctx context.Context, req dto.UpdateTeleconsultRequest) (*dto.TeleconsultResponse, error) {
	if err := validator.ValidateTeleconsultUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Teleconsult{ID: req.ID}
	updated, err := s.repo.UpdateTeleconsult(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TeleconsultResponse{ID: updated.ID}, nil
}
