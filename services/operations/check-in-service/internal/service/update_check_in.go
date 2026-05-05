package service

import (
	"context"
	"github.com/tenadam/check-in-service/internal/dto"
	"github.com/tenadam/check-in-service/internal/model"
	"github.com/tenadam/check-in-service/internal/validator"
)

// UpdateCheckIn validates and updates an existing check-in.
func (s *Service) UpdateCheckIn(ctx context.Context, req dto.UpdateCheckInRequest) (*dto.CheckInResponse, error) {
	if err := validator.ValidateCheckInUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.CheckIn{ID: req.ID}
	updated, err := s.repo.UpdateCheckIn(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.CheckInResponse{ID: updated.ID}, nil
}
