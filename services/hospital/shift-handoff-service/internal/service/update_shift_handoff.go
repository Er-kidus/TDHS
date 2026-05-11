package service

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/dto"
	"github.com/tenadam/shift-handoff-service/internal/model"
	"github.com/tenadam/shift-handoff-service/internal/validator"
)

// UpdateShiftHandoff validates and updates an existing shift-handoff.
func (s *Service) UpdateShiftHandoff(ctx context.Context, req dto.UpdateShiftHandoffRequest) (*dto.ShiftHandoffResponse, error) {
	if err := validator.ValidateShiftHandoffUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ShiftHandoff{ID: req.ID}
	updated, err := s.repo.UpdateShiftHandoff(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ShiftHandoffResponse{ID: updated.ID}, nil
}
