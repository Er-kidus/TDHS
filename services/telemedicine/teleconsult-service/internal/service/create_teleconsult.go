package service

import (
	"context"
	"github.com/tenadam/teleconsult-service/internal/dto"
	"github.com/tenadam/teleconsult-service/internal/model"
	"github.com/tenadam/teleconsult-service/internal/validator"
)

// CreateTeleconsult validates and creates a new teleconsult.
func (s *Service) CreateTeleconsult(ctx context.Context, req dto.CreateTeleconsultRequest) (*dto.TeleconsultResponse, error) {
	if err := validator.ValidateTeleconsultCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Teleconsult{}
	created, err := s.repo.CreateTeleconsult(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.TeleconsultResponse{ID: created.ID}, nil
}
