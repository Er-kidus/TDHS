package service

import (
	"context"
	"github.com/tenadam/dispensing-service/internal/dto"
	"github.com/tenadam/dispensing-service/internal/model"
	"github.com/tenadam/dispensing-service/internal/validator"
)

// UpdateDispensing validates and updates an existing dispensing.
func (s *Service) UpdateDispensing(ctx context.Context, req dto.UpdateDispensingRequest) (*dto.DispensingResponse, error) {
	if err := validator.ValidateDispensingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Dispensing{ID: req.ID}
	updated, err := s.repo.UpdateDispensing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DispensingResponse{ID: updated.ID}, nil
}
