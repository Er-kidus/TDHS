package service

import (
	"context"
	"github.com/tenadam/shift-handoff-service/internal/dto"
	"github.com/tenadam/shift-handoff-service/internal/model"
	"github.com/tenadam/shift-handoff-service/internal/validator"
)

// CreateShiftHandoff validates and creates a new shift-handoff.
func (s *Service) CreateShiftHandoff(ctx context.Context, req dto.CreateShiftHandoffRequest) (*dto.ShiftHandoffResponse, error) {
	if err := validator.ValidateShiftHandoffCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ShiftHandoff{}
	created, err := s.repo.CreateShiftHandoff(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ShiftHandoffResponse{ID: created.ID}, nil
}
