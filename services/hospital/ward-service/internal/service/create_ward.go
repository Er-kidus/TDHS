package service

import (
	"context"
	"github.com/tenadam/ward-service/internal/dto"
	"github.com/tenadam/ward-service/internal/model"
	"github.com/tenadam/ward-service/internal/validator"
)

// CreateWard validates and creates a new ward.
func (s *Service) CreateWard(ctx context.Context, req dto.CreateWardRequest) (*dto.WardResponse, error) {
	if err := validator.ValidateWardCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Ward{}
	created, err := s.repo.CreateWard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.WardResponse{ID: created.ID}, nil
}
