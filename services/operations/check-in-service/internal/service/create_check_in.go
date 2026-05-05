package service

import (
	"context"
	"github.com/tenadam/check-in-service/internal/dto"
	"github.com/tenadam/check-in-service/internal/model"
	"github.com/tenadam/check-in-service/internal/validator"
)

// CreateCheckIn validates and creates a new check-in.
func (s *Service) CreateCheckIn(ctx context.Context, req dto.CreateCheckInRequest) (*dto.CheckInResponse, error) {
	if err := validator.ValidateCheckInCreate(req); err != nil {
		return nil, err
	}
	entity := &model.CheckIn{}
	created, err := s.repo.CreateCheckIn(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.CheckInResponse{ID: created.ID}, nil
}
