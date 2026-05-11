package service

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/dto"
	"github.com/tenadam/dispensing-service/internal/model"
	"github.com/tenadam/dispensing-service/internal/validator"
)

// CreateDispensing validates and creates a new dispensing.
func (s *Service) CreateDispensing(ctx context.Context, req dto.CreateDispensingRequest) (*dto.DispensingResponse, error) {
	if err := validator.ValidateDispensingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Dispensing{}
	created, err := s.repo.CreateDispensing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DispensingResponse{ID: created.ID}, nil
}
